from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os


class RAGService:
    def __init__(self):
        # Inicializa OpenAI embeddings y Chroma vector store
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Configura el splitter para fragmentar documentos
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Inicializa Chroma para almacenar vectores
        self.vector_store = Chroma(
            collection_name="documents",
            embedding_function=self.embeddings,
            persist_directory="/data/chroma"
        )
    
    def add_document(self, text: str, document_id: str, filename: str):
        # Divide el texto en chunks y los guarda con metadatos
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
        # Busca los chunks mas relevantes basado en similitud
        try:
            results = self.vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error buscando en el vector store: {e}")
            return []