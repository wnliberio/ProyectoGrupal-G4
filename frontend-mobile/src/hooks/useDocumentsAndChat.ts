import { useState, useCallback, useEffect } from 'react';
import { documentsAPI, chatAPI } from '@/src/services/api';

export interface Document {
  document_id: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useDocumentsAndChat = (userId: string, documentId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await documentsAPI.list(userId);
      setDocuments(docs);
    } catch (err) {
      setError('Error cargando documentos');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
    useEffect(() => {
    loadDocuments();
  }, [userId, loadDocuments]);

  const uploadDocument = useCallback(
    async (fileUri: string, fileName: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await documentsAPI.upload(userId, fileUri, fileName);
        const newDoc: Document = {
          document_id: result.document_id,
          file_name: result.file_name,
          file_size: 0,
          uploaded_at: new Date().toISOString(),
        };
        setDocuments((prev) => [newDoc, ...prev]);
        return newDoc;
      } catch (err: any) {
        const errorMsg = err.message || 'Error subiendo documento';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const selectDocument = useCallback(async (doc: Document) => {
    setSelectedDocument(doc);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const docId = documentId || selectedDocument?.document_id;
      
      if (!docId) {
        setError('Selecciona un documento primero');
        return;
      }

      if (!text.trim()) {
        setError('Mensaje vacio');
        return;
      }

      setLoading(true);
      setError(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const result = await chatAPI.send(userId, docId, text);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.answer || 'Sin respuesta',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        const errorMsg = err.message || 'Error en chat';
        setError(errorMsg);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [selectedDocument, userId, documentId]
  );

  const deleteDocument = useCallback(
    async (documentId: string) => {
      setError(null);
      try {
        await documentsAPI.delete(userId, documentId);
        setDocuments((prev) =>
          prev.filter((doc) => doc.document_id !== documentId)
        );
        if (selectedDocument?.document_id === documentId) {
          setSelectedDocument(null);
          setMessages([]);
        }
      } catch (err: any) {
        setError(err.message || 'Error eliminando documento');
      }
    },
    [userId, selectedDocument]
  );

  return {
    documents,
    selectedDocument,
    messages,
    loading,
    error,
    uploadDocument,
    selectDocument,
    sendMessage,
    deleteDocument,
  };
}