from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings  
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os

class RAGService:
    def __init__(self):
        """Inicializa RAG con Chroma + HuggingFace Embeddings (gratis, sin límites)"""
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
        self.vector_store = Chroma(
            collection_name="documents",
            embedding_function=self.embeddings,
            persist_directory="/data/chroma"
        )
    
    def add_document(self, text: str, document_id: str, filename: str):
        """Chunka documento y lo guarda en Chroma con metadatos"""
        chunks = self.splitter.split_text(text)
        
        documents = []
        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk,
                metadata={
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
            )
            documents.append(doc)
        
        self.vector_store.add_documents(documents)
        return len(documents)
    
    def search(self, query: str, k: int = 5):
        """Busca chunks por SIMILITUD PURA"""
        try:
            # Similarity search = chunks MÁS RELEVANTES
            results = self.vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error en búsqueda RAG: {e}")
            return []