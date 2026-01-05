// 📁 DIRECTORIO: app/(chat)/trash.tsx
// 📄 ARCHIVO: trash.tsx
// 🔧 VERSIÓN CORREGIDA: Errores de casteo y tipado mejorado

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  MessageSquare,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useChats } from '@/src/hooks/useChats';
import { DeletedChat } from '@/src/types';

export default function TrashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { deletedChats, restoreChat, deletePermanently } = useChats();

  const handleRestore = (chatId: string): void => {
    restoreChat(chatId);
    Alert.alert('Éxito', 'Documento restaurado correctamente');
  };

  const handlePermanentDelete = (chatId: string, title: string): void => {
    Alert.alert(
      'Eliminar Permanentemente',
      `¿Eliminar "${title}" de forma permanente? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            deletePermanently(chatId);
            Alert.alert('Eliminado', 'Documento eliminado permanentemente');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderTrashItem: ListRenderItem<DeletedChat> = ({ item }) => {
    const timeAgo = new Date(item.deletedAt).toLocaleDateString('es-ES');

    return (
      <View
        style={[
          styles.trashItem,
          { backgroundColor: colors.inputBackground },
        ]}
      >
        <View style={styles.itemLeft}>
          <View style={styles.iconContainer}>
            <MessageSquare size={24} color="#a855f7" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemDetail, { color: colors.muted }]}>
              {item.fileName}
            </Text>
            <Text style={[styles.itemDate, { color: colors.muted }]}>
              Eliminado: {timeAgo}
            </Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => handleRestore(item.id)}
          >
            <RotateCcw size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => handlePermanentDelete(item.id, item.title)}
          >
            <Trash2 size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isTrashEmpty = deletedChats.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Papelera
        </Text>
        <Text style={[styles.headerCount, { color: colors.muted }]}>
          {deletedChats.length}
        </Text>
      </View>

      {/* Content */}
      {isTrashEmpty ? (
        <View style={styles.emptyContainer}>
          <Trash2 size={64} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Papelera vacía
          </Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Los documentos eliminados aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedChats}
          renderItem={renderTrashItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  trashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});