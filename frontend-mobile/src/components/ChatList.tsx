/*Componente UI que muestra la lista de documentos/chats, permite subir documentos (DocumentPicker),
     abrir un chat, borrar chats y acceder a perfil o papelera. 
         Maneja iconos por tipo de archivo, formatea fechas, y renderiza estados vacíos.
*/

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, Trash2, User, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Chat } from '@/src/types';

interface ChatListProps {
  chats: Chat[];
  deletedChatsCount: number;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onShowProfile: () => void;
  onShowTrash: () => void;

  // CAMBIO: ahora recibe nombre + uri reales
  onNewChat: (fileName: string, fileUri: string) => void;
}

export function ChatList({
  chats,
  deletedChatsCount,
  onSelectChat,
  onDeleteChat,
  onShowProfile,
  onShowTrash,
  onNewChat,
}: ChatListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) return 'Ahora';
      return `hace ${hours}h`;
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `${days}d`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  const handleDeleteClick = (chatId: string): void => {
    Alert.alert(
      'Eliminar',
      '¿Deseas mover este documento a la papelera?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            onDeleteChat(chatId);
            setShowDeleteId(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // ===============================
  // SOLUCIÓN REAL (NO ROMPE NADA)
  // ===============================
  const handleNewChat = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const fileName = file.name; // nombre real
      const fileUri = file.uri;   // uri real

      onNewChat(fileName, fileUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const hasChatItems = useMemo(() => chats.length > 0, [chats.length]);
  const hasDeletedChats = useMemo(
    () => deletedChatsCount > 0,
    [deletedChatsCount]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Mis Documentos
        </Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={onShowProfile}
        >
          <User size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Upload Button */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleNewChat}
        >
          <Upload size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Subir Documento</Text>
        </TouchableOpacity>

        {hasDeletedChats ? (
          <TouchableOpacity
            style={[
              styles.trashButton,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={onShowTrash}
          >
            <View style={styles.trashIconContainer}>
              <Trash2 size={20} color="#dc2626" />
            </View>
            <View style={styles.trashContent}>
              <Text
                style={[styles.trashTitle, { color: colors.text }]}
              >
                Papelera
              </Text>
              <Text
                style={[styles.trashCount, { color: colors.muted }]}
              >
                {deletedChatsCount} documento
                {deletedChatsCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chat List */}
      {!hasChatItems ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <FileText size={40} color={colors.muted} />
          </View>
          <Text
            style={[styles.emptyTitle, { color: colors.text }]}
          >
            No hay documentos
          </Text>
          <Text
            style={[styles.emptyText, { color: colors.muted }]}
          >
            Sube un documento para empezar a chatear
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item: chat }) => (
            <ChatListItem
              chat={chat}
              colors={colors}
              getFileIcon={getFileIcon}
              formatTime={formatTime}
              onSelect={() => onSelectChat(chat)}
              onDelete={() => handleDeleteClick(chat.id)}
              showDelete={showDeleteId === chat.id}
              onShowDelete={() => setShowDeleteId(chat.id)}
            />
          )}
        />
      )}
    </View>
  );
}

interface ChatListItemProps {
  chat: Chat;
  colors: typeof Colors.light;
  getFileIcon: (fileType: string) => string;
  formatTime: (date: Date) => string;
  onSelect: () => void;
  onDelete: () => void;
  showDelete: boolean;
  onShowDelete: () => void;
}

function ChatListItem({
  chat,
  colors,
  getFileIcon,
  formatTime,
  onSelect,
  onDelete,
  showDelete,
  onShowDelete,
}: ChatListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.border }]}
      onPress={onSelect}
      onLongPress={onShowDelete}
    >
      <View style={styles.chatItemContent}>
        <View
          style={[
            styles.chatIcon,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text style={styles.fileIcon}>
            {getFileIcon(chat.fileType)}
          </Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTitleRow}>
            <Text
              style={[styles.chatTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {chat.title}
            </Text>
            <Text
              style={[styles.chatTime, { color: colors.muted }]}
            >
              {formatTime(chat.timestamp)}
            </Text>
          </View>
          <Text
            style={[styles.chatMessage, { color: colors.muted }]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
        </View>
      </View>

      {showDelete ? (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={onDelete}
        >
          <Trash2 size={20} color="#dc2626" />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '600' },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trashButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  trashIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashContent: { flex: 1 },
  trashTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  trashCount: { fontSize: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatItemContent: { flex: 1, flexDirection: 'row', gap: 12 },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: { fontSize: 24 },
  chatInfo: { flex: 1 },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  chatTime: { fontSize: 12, marginLeft: 8 },
  chatMessage: { fontSize: 13 },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
