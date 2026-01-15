/*Contexto global de autenticación. Mantiene el usuario y estado de sesión, y define funciones login 
   y logout (mock). También expone useAuth para consumir el contexto.
*/
import React, { createContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    const dummyUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0] || 'Usuario',
    };
    setUser(dummyUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}