// 📁 DIRECTORIO: src/types/index.ts
// 📄 ARCHIVO: index.ts
// 🔧 Definiciones de tipos TypeScript para la aplicación

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export interface DeletedChat extends Chat {
  deletedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}