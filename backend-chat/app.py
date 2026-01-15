from urllib.parse import unquote
from fastapi import FastAPI, UploadFile, File, HTTPException
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import os
import fitz
from dotenv import load_dotenv
from pydantic import BaseModel

from rag_service import RAGService
from langchain_openai import ChatOpenAI

class ChatRequest(BaseModel):
    user_id: str
    document_id: str
    message: str


load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or "mongodb://mongo:27017"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configuracion del agente
NOMBRE_AGENTE = "Cliofer"
SALUDO_INICIAL = (
    f"Hola, soy {NOMBRE_AGENTE}. "
    "Estoy aqui para conversar contigo sobre los documentos que compartimos. "
    "Que deseas saber?"
)

PROMPT_INICIAL = f"""Eres {NOMBRE_AGENTE}, un asistente amable, conversacional y accesible.

Tu forma de ser:
- Saludas de forma natural y calida
- Haces preguntas de seguimiento cuando es necesario
- Demuestras comprension y empatia
- Eres flexible en tus respuestas
- Puedes hacer observaciones relevantes
- Recuerdas el contexto de la conversacion

Reglas importantes:
- Responde SIEMPRE basandote en los documentos
- Si no sabes algo, sé honesto: No tengo esa informacion en el documento
- Sé conciso pero conversacional
- No muestres detalles tecnicos
- Siente libertad para ser un poco creativo

Tu tono: amigable, profesional, humano."""


app = FastAPI(title="CHAT API")
mongo = MongoClient(MONGO_URI)
chat_collection = mongo["rag_db"]["chat_history"]

# Inicializa el servicio RAG
rag_service = RAGService()


def extract_text(file: UploadFile) -> str:
    # Extrae texto de archivos PDF
    doc = fitz.open(stream=file.file.read(), filetype="pdf")
    return "".join(page.get_text() for page in doc)


def save_message(user_id, document_id, role, content):
    # Guarda los mensajes en MongoDB
    chat_collection.insert_one({
        "user_id": user_id,
        "document_id": document_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    })


def get_history(user_id, document_id):
    # Recupera el historial de chat
    return list(
        chat_collection.find(
            {"user_id": user_id, "document_id": document_id}
        ).sort("timestamp", 1)
    )


def ensure_first_message(user_id, document_id):
    # Si es la primera vez, envía el saludo inicial
    count = chat_collection.count_documents({
        "user_id": user_id,
        "document_id": document_id
    })
    if count == 0:
        save_message(user_id, document_id, "assistant", SALUDO_INICIAL)


@app.post("/documents/upload")
async def upload_document(user_id: str, file: UploadFile = File(...)):
    # Maneja la carga de documentos PDF
    try:
        text = extract_text(file)
        
        document_id = str(uuid4())
        file_name = unquote(file.filename)
        
        # Guarda el documento en MongoDB
        result = mongo["rag_db"]["documents"].insert_one({
            "user_id": user_id,
            "document_id": document_id,
            "file_name": file_name,
            "content": text,
            "uploaded_at": datetime.utcnow(),
            "deleted_at": None
        })
        print(f"Documento insertado: {result.inserted_id}")
        
        # Chunka el documento y lo guarda en Chroma
        chunks_count = rag_service.add_document(text, document_id, file_name)
        print(f"Documento {file_name} procesado: {chunks_count} chunks")
        
        ensure_first_message(user_id, document_id)
        
        return {
            "document_id": document_id,
            "file_name": file_name,
            "chunks": chunks_count
        }
    except Exception as e:
        print(f"Error al subir documento: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    
@app.get("/documents")
async def get_documents(user_id: str):
    # Lista todos los documentos del usuario
    docs = list(mongo["rag_db"]["documents"].find(
        {"user_id": user_id},
        {"content": 0}
    ).sort("uploaded_at", -1))
    
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    
    return {"documents": docs}


@app.post("/chat")
async def chat(req: ChatRequest):
    # Procesa los mensajes del usuario con RAG
    print(f"Mensaje recibido de {req.user_id}")
    
    try:
        user_id = req.user_id
        document_id = req.document_id
        message = req.message
        
        ensure_first_message(user_id, document_id)
        
        # Busca los chunks mas relevantes en Chroma
        relevant_chunks = rag_service.search(message, k=5)
        
        # Prepara el contexto sin mostrar detalles tecnicos
        if relevant_chunks:
            chunk_text = "\n---\n".join([
                doc.page_content
                for doc in relevant_chunks
            ])
        else:
            chunk_text = "No hay informacion disponible en los documentos."
        
        # Obtiene el historial de conversacion
        history = get_history(user_id, document_id)
        formatted_history = "\n".join(f"{m['role']}: {m['content']}" for m in history)
        
        # Arma el prompt con el contexto
        prompt = f"""{PROMPT_INICIAL}

Informacion del documento:
{chunk_text}

Conversacion previa:
{formatted_history}

El usuario pregunta: {message}

Responde de forma natural y conversacional. 
Si no esta en los documentos, dilo sin ser robotico."""
        
        # Usa OpenAI para generar la respuesta
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            api_key=OPENAI_API_KEY
        )
        answer = llm.invoke(prompt).content
        
        # Guarda los mensajes en el historial
        save_message(user_id, document_id, "user", message)
        save_message(user_id, document_id, "assistant", answer)
        
        
        return {"answer": answer}
    
    #
    except Exception as e:
        print(f"Error en chat: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/documents/{document_id}")
async def delete_document(user_id: str, document_id: str):
    # Soft delete de documentos
    try:
        mongo["rag_db"]["documents"].update_one(
            {"document_id": document_id, "user_id": user_id},
            {"$set": {"deleted_at": datetime.utcnow()}}
        )
        return {"message": "Documento eliminado"}
    except Exception as e:
        print(f"Error al eliminar: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/chat/history")
async def get_chat_history(user_id: str, document_id: str):
    # Devuelve el historial completo de chat
    history = get_history(user_id, document_id)
    for msg in history:
        msg["_id"] = str(msg["_id"])
    return history