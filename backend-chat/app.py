from urllib.parse import unquote
from fastapi import FastAPI, UploadFile, File
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import os
import fitz
from dotenv import load_dotenv
from pydantic import BaseModel

class ChatRequest(BaseModel):
    user_id: str
    document_id: str
    message: str

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
#from langchain_google_genai import GoogleGenerativeAiEmbeddings as GGAiEmbeddings
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
    "Estoy aquí para ayudarte con consultas basadas en los documentos proporcionados. "
    "¿En qué puedo ayudarte hoy?"
)

PROMPT_INICIAL = f"""
Eres {NOMBRE_AGENTE}, asistente IA.
Solo puedes responder usando la información contenida en los documentos.
Si una pregunta está fuera del contexto, indícalo de forma amable.
Siempre sé profesional y claro.
"""


# ======================
# APP
# ======================

app = FastAPI(title="CHAT API")

mongo = MongoClient(MONGO_URI)
chat_collection = mongo["rag_db"]["chat_history"]

#embeddings = GGAiEmbeddings(
#    model="models/embedding-001",
#    google_api_key=API_KEY
#)

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

#def get_vectordb(user_id: str, document_id: str):
 #   path = f"{CHROMA_PATH}/{user_id}/{document_id}"
  #  return Chroma(
   #     collection_name=f"{user_id}_{document_id}",
    #    embedding_function=embeddings,
     #   persist_directory=path
    #)

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
    text = extract_text(file)
    
    document_id = str(uuid4())
    file_name = unquote(file.filename)  # Decodifica "document%3A66660" → "document.pdf"
    
    # Guardar documento en MongoDB
    try:
        result = mongo["rag_db"]["documents"].insert_one({
            "user_id": user_id,
            "document_id": document_id,
            "file_name": file_name,  # Usa el decodificado
            "content": text,
            "uploaded_at": datetime.utcnow()
        })
        print(f"✓ Document inserted: {result.inserted_id}")
    except Exception as e:
        print(f"✗ ERROR inserting document: {e}")
        raise
    
    ensure_first_message(user_id, document_id)
    
    return {
        "document_id": document_id,
        "file_name": file_name  # Devuelve el decodificado
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    print("📩 Request recibida:")
    print(req)
    print(req.model_dump())
    
    user_id = req.user_id
    document_id = req.document_id
    message = req.message

    ensure_first_message(user_id, document_id)

    # VA a MongoDB y recupera el PDF
    doc = mongo["rag_db"]["documents"].find_one({
        "user_id": user_id,
        "document_id": document_id
    })
    
    document_content = doc["content"] if doc else "No se encontró el documento"

    # VA a MongoDB y recupera el historial
    history = get_history(user_id, document_id)
    formatted_history = "\n".join(f"{m['role']}: {m['content']}" for m in history)

    prompt = f"""
{PROMPT_INICIAL} # Instrucción: "Eres Cliofer, etc etc

Documento:
{document_content} # TODO el contenido del PDF (texto completo)

Historial:
{formatted_history}  # Conversación anterior: "user: hola" "asistente: hola etc etc

Usuario:
{message}  # La pregunta nueva del usuario
"""

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, google_api_key=API_KEY)
    answer = llm.invoke(prompt).content

    save_message(user_id, document_id, "user", message)
    save_message(user_id, document_id, "assistant", answer)

    return {"answer": answer}