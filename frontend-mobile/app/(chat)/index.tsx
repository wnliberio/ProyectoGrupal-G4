import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDocumentsAndChat } from '@/src/hooks/useDocumentsAndChat';
import { Colors } from '@/constants/Colors';
import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker'; // para traer el nombre del documneto

export default function DocumentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const userId = user?.id || 'user-test';
  const { documents, loading, error, uploadDocument, selectDocument } =
    useDocumentsAndChat(userId);


const handlePickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const fileName = file.name || 'documento.pdf';
      
      setUploading(true);
      try {
        const newDoc = await uploadDocument(file.uri, fileName);
        Alert.alert('Exito', 'Documento subido correctamente');
      } catch (err) {
        Alert.alert('Error', 'No se pudo subir el documento');
      } finally {
        setUploading(false);
      }
    }
  } catch (err) {
    Alert.alert('Error', 'Error seleccionando archivo');
  }
};

  const handleSelectDocument = async (doc: any) => {
    await selectDocument(doc);
    router.push({
      pathname: '/(chat)/chat',
      params: { documentId: doc.document_id, documentName: doc.file_name },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mis Documentos
        </Text>
      </View>

      {error && (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
          ]}
        >
          <Text style={{ color: '#991b1b' }}>{error}</Text>
        </View>
      )}

      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            uploading && styles.uploadButtonDisabled,
          ]}
          onPress={handlePickDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Subir PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Sin documentos aun. Sube uno para empezar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.document_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.documentItem,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => handleSelectDocument(item)}
            >
              <View style={styles.documentContent}>
                <Text
                  style={[styles.documentName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.file_name}
                </Text>
                <Text style={[styles.documentDate, { color: colors.muted }]}>
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorBox: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  uploadSection: {
    padding: 16,
  },
  uploadButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  documentItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
  },
});