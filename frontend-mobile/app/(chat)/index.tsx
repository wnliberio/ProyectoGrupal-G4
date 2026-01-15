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
import * as DocumentPicker from 'expo-document-picker';
import ScreenContainer from '@/src/components/ScreenContainer';

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
          await uploadDocument(file.uri, fileName);
          Alert.alert('Éxito', 'Documento subido correctamente');
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
      params: {
        documentId: doc.document_id,
        documentName: doc.file_name,
      },
    });
  };

  return (
    <ScreenContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Mis Documentos
          </Text>
        </View>

        {/* ERROR */}
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

        {/* UPLOAD */}
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

        {/* LISTA */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Sin documentos aún. Sube uno para empezar.
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.document_id}
            contentContainerStyle={styles.listContent}
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
                  <Text
                    style={[
                      styles.documentDate,
                      { color: colors.muted },
                    ]}
                  >
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 36,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  errorBox: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  uploadSection: {
    paddingVertical: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '96%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  documentItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderRadius: 12,
    width: '100%',
    // card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  documentDate: {
    fontSize: 13,
    opacity: 0.85,
  },
});
