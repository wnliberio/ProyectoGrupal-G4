from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastembed import TextEmbedding
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings.embeddings import Embeddings
import os


class FastEmbedWrapper(Embeddings):
    """Wrapper de FastEmbed compatible con Chroma"""
    def __init__(self):
        self.model = TextEmbedding(
            model_name="BAAI/bge-small-en-v1.5",
            cache_folder="/data/embeddings"
        )
    
    def embed_documents(self, texts):
        return [list(embedding) for embedding in self.model.embed(texts)]
    
    def embed_query(self, text):
        return list(self.model.embed([text])[0])


class RAGService:
    def __init__(self):
        """Inicializa RAG con Chroma + FastEmbed (ligero, sin CUDA)"""
        self.embeddings = FastEmbedWrapper()
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
        """Busca chunks relevantes por similitud pura"""
        try:
            results = self.vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error en búsqueda RAG: {e}")
            return []