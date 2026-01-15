from urllib.parse import unquote
from fastapi import FastAPI, UploadFile, File, HTTPException
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import os
import fitz
from dotenv import load_dotenv
from pydantic import BaseModel

# ============================================
# IMPORTS RAG
# ============================================
from rag_service import RAGService

class ChatRequest(BaseModel):
    user_id: str
    document_id: str
    message: str

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# ======================
# CONFIG
# ======================
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or "mongodb://mongo:27017"
API_KEY = os.getenv("GOOGLE_API_KEY")
CHROMA_PATH = "./data/chroma"
NOMBRE_AGENTE = "Cliofer"
SALUDO_INICIAL = (
    f"Hola, soy {NOMBRE_AGENTE}. "
    "Estoy aquí para conversar contigo sobre los documentos que compartimos. "
    "¿Qué deseas saber?"
)
PROMPT_INICIAL = f"""
Eres {NOMBRE_AGENTE}, un asistente amable, conversacional y accesible.

TU PERSONALIDAD:
- Saludas de forma natural y cálida
- Puedes hacer preguntas de seguimiento
- Demuestras comprensión y empatía
- Eres flexible en tus respuestas
- Puedes hacer observaciones o comentarios relevantes
- Recuerdas el contexto de la conversación

IMPORTANTE:
- Responde SIEMPRE basándote en los documentos
- Si no conoces algo, sé honesto: "No tengo esa información en el documento"
- Sé conciso pero conversacional
- No muestres metadatos técnicos (chunks, archivos, números)
- Siente libertad para ser un poco creativo en tu comunicación

TONO: amigable, profesional, humano.
"""

# ======================
# APP
# ======================
app = FastAPI(title="CHAT API")
mongo = MongoClient(MONGO_URI)
chat_collection = mongo["rag_db"]["chat_history"]

# ============================================
# INICIALIZA RAG SERVICE
# ============================================
rag_service = RAGService()

# ======================
# HELPERS
# ======================
def extract_text(file: UploadFile) -> str:
    doc = fitz.open(stream=file.file.read(), filetype="pdf")
    return "".join(page.get_text() for page in doc)

def split_text(text: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_text(text)

def save_message(user_id, document_id, role, content):
    chat_collection.insert_one({
        "user_id": user_id,
        "document_id": document_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    })

def get_history(user_id, document_id):
    return list(
        chat_collection.find(
            {"user_id": user_id, "document_id": document_id}
        ).sort("timestamp", 1)
    )


def ensure_first_message(user_id, document_id):
    count = chat_collection.count_documents({
        "user_id": user_id,
        "document_id": document_id
    })
    if count == 0:
        save_message(user_id, document_id, "assistant", SALUDO_INICIAL)

# ======================
# ROUTES
# ======================


@app.post("/documents/upload")
async def upload_document(user_id: str, file: UploadFile = File(...)):
    """Sube documento y lo guarda en MongoDB + Chroma (RAG)"""
    try:
        text = extract_text(file)
        
        document_id = str(uuid4())
        file_name = unquote(file.filename)
        
        # Guardar documento en MongoDB
        result = mongo["rag_db"]["documents"].insert_one({
            "user_id": user_id,
            "document_id": document_id,
            "file_name": file_name,
            "content": text,
            "uploaded_at": datetime.utcnow(),
            "deleted_at": None
        })
        print(f"✓ Document inserted: {result.inserted_id}")
        
        # ============================================
        # NUEVO: Guarda en Chroma para RAG
        # ============================================
        chunks_count = rag_service.add_document(text, document_id, file_name)
        print(f"Documento {file_name} procesado: {chunks_count} chunks en Chroma")
        
        ensure_first_message(user_id, document_id)
        
        return {
            "document_id": document_id,
            "file_name": file_name,
            "chunks": chunks_count
        }
    except Exception as e:
        print(f"✗ ERROR al subir documento: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    
@app.get("/documents")
async def get_documents(user_id: str):
    docs = list(mongo["rag_db"]["documents"].find(
        {"user_id": user_id},
        {"content": 0}
    ).sort("uploaded_at", -1))
    
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    
    return {"documents": docs}

@app.post("/chat")
async def chat(req: ChatRequest):
    """Chat con RAG: busca chunks relevantes + responde"""
    print(" Request recibida:")
    print(req)
    print(req.model_dump())
    
    try:
        user_id = req.user_id
        document_id = req.document_id
        message = req.message
        
        ensure_first_message(user_id, document_id)
        
        # ============================================
        # NUEVO: Busca chunks relevantes en Chroma
        # ============================================
        relevant_chunks = rag_service.search(message, k=3)
        
        # Arma contexto desde chunks
        if relevant_chunks:
            chunk_text = "\n---\n".join([
                f"{doc.page_content}\n(Archivo: {doc.metadata['filename']}, Chunk: {doc.metadata['chunk_index']})"
                for doc in relevant_chunks
            ])
        else:
            chunk_text = "No hay contexto disponible en los documentos."
        
        # Obtiene historial de chat
        history = get_history(user_id, document_id)
        formatted_history = "\n".join(f"{m['role']}: {m['content']}" for m in history)
        
        # ============================================
        # PROMPT MEJORADO CON CONTEXTO RAG
        # ============================================
        prompt = f"""
{PROMPT_INICIAL}

DOCUMENTOS DISPONIBLES:
{chunk_text}

CONVERSACIÓN PREVIA:
{formatted_history}

EL USUARIO DICE: "{message}"

Responde de forma natural y conversacional. 
Si no está en los documentos, dilo sin ser robótico.
Puedes hacer preguntas de seguimiento si es útil.
"""
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.3,
            google_api_key=API_KEY
        )
        answer = llm.invoke(prompt).content
        
        save_message(user_id, document_id, "user", message)
        save_message(user_id, document_id, "assistant", answer)
        
        return {"answer": answer}
    
    except Exception as e:
        print(f"✗ ERROR en chat: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(user_id: str, document_id: str):
    """Soft delete de documento"""
    try:
        mongo["rag_db"]["documents"].update_one(
            {"document_id": document_id, "user_id": user_id},
            {"$set": {"deleted_at": datetime.utcnow()}}
        )
        return {"message": "Documento eliminado"}
    except Exception as e:
        print(f"✗ ERROR al eliminar: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/chat/history")
async def get_chat_history(user_id: str, document_id: str):
    """Obtiene historial de chat"""
    history = get_history(user_id, document_id)
    for msg in history:
        msg["_id"] = str(msg["_id"])
    return history