// 📁 DIRECTORIO: src/hooks/useChats.ts
// 📄 ARCHIVO: useChats.ts
// 🔧 VERSIÓN CORREGIDA: Tipado mejorado y gestión de estado segura

import { useState, useCallback, useMemo } from 'react';
import { Chat, Message, DeletedChat } from '../types';

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    title: 'Análisis de Presupuesto 2024',
    fileName: 'presupuesto_2024.pdf',
    fileType: 'pdf',
    lastMessage: '¿Puedes resumir los gastos del Q1?',
    timestamp: new Date('2024-12-16T10:30:00'),
    messages: [
      {
        id: '1',
        content: 'Hola, he subido el documento de presupuesto',
        sender: 'user',
        timestamp: new Date('2024-12-16T10:20:00'),
      },
      {
        id: '2',
        content: 'Perfecto, he analizado el documento. ¿En qué puedo ayudarte?',
        sender: 'ai',
        timestamp: new Date('2024-12-16T10:20:30'),
      },
      {
        id: '3',
        content: '¿Puedes resumir los gastos del Q1?',
        sender: 'user',
        timestamp: new Date('2024-12-16T10:30:00'),
      },
    ],
  },
  {
    id: '2',
    title: 'Contrato de Servicios',
    fileName: 'contrato_servicios.docx',
    fileType: 'docx',
    lastMessage: '¿Cuáles son las cláusulas principales?',
    timestamp: new Date('2024-12-15T14:20:00'),
    messages: [
      {
        id: '1',
        content: 'Analiza este contrato',
        sender: 'user',
        timestamp: new Date('2024-12-15T14:15:00'),
      },
      {
        id: '2',
        content: 'He revisado el contrato. Tiene 12 páginas y cubre servicios de consultoría.',
        sender: 'ai',
        timestamp: new Date('2024-12-15T14:15:30'),
      },
      {
        id: '3',
        content: '¿Cuáles son las cláusulas principales?',
        sender: 'user',
        timestamp: new Date('2024-12-15T14:20:00'),
      },
    ],
  },
];

interface UseChatReturn {
  chats: Chat[];
  deletedChats: DeletedChat[];
  selectedChat: Chat | null;
  addChat: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  restoreChat: (chatId: string) => void;
  deletePermanently: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  setSelectedChat: (chat: Chat | null) => void;
}

export function useChats(): UseChatReturn {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [deletedChats, setDeletedChats] = useState<DeletedChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const addChat = useCallback((chat: Chat): void => {
    setChats((prev) => [chat, ...prev]);
  }, []);

  const deleteChat = useCallback(
    (chatId: string): void => {
      const chatToDelete = chats.find((c) => c.id === chatId);
      if (chatToDelete) {
        setDeletedChats((prev) => [
          { ...chatToDelete, deletedAt: new Date() },
          ...prev,
        ]);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      }
    },
    [chats, selectedChat]
  );

  const restoreChat = useCallback(
    (chatId: string): void => {
      const chatToRestore = deletedChats.find((c) => c.id === chatId);
      if (chatToRestore) {
        const { deletedAt, ...chat } = chatToRestore;
        setChats((prev) => [chat, ...prev]);
        setDeletedChats((prev) => prev.filter((c) => c.id !== chatId));
      }
    },
    [deletedChats]
  );

  const deletePermanently = useCallback((chatId: string): void => {
    setDeletedChats((prev) => prev.filter((c) => c.id !== chatId));
  }, []);

  const addMessage = useCallback((chatId: string, message: Message): void => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.content,
              timestamp: new Date(),
            }
          : chat
      )
    );

    setSelectedChat((prev) =>
      prev && prev.id === chatId
        ? {
            ...prev,
            messages: [...prev.messages, message],
            lastMessage: message.content,
            timestamp: new Date(),
          }
        : prev
    );
  }, []);

  return useMemo(
    () => ({
      chats,
      deletedChats,
      selectedChat,
      addChat,
      deleteChat,
      restoreChat,
      deletePermanently,
      addMessage,
      setSelectedChat,
    }),
    [chats, deletedChats, selectedChat, addChat, deleteChat, restoreChat, deletePermanently, addMessage]
  );
}