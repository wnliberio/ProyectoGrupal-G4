import React, { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Animated,
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
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<number | null>(null);

  const showBanner = (msg: string) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setBannerMessage(msg);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    hideTimeout.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        setBannerMessage(null);
      });
    }, 2000) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const userId = user?.id || 'user-test';
  const { documents, loading, error, uploadDocument, selectDocument } =
    useDocumentsAndChat(userId);

  // Selecciona archivo PDF en móvil, input en web
  const handlePickDocument = async () => {
    if (Platform.OS === 'web') return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      if (!result.canceled && result.assets?.length) {
        setSelectedFile(result.assets[0]);
      } else {
        setSelectedFile(null);
      }
    } catch {
      showBanner('Error seleccionando archivo');
    }
  };

  // Handler para input web
  const handleWebInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile({
        uri: URL.createObjectURL(file),
        name: file.name,
        fileObject: file,
      });
    } else {
      setSelectedFile(null);
      showBanner('Solo se permite PDF');
    }
  };

  // Sube el archivo seleccionado al API
  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await uploadDocument(selectedFile.uri, selectedFile.name || 'documento.pdf');
      setSelectedFile(null);
    } catch {
      showBanner('No se pudo subir el documento');
    } finally {
      setUploading(false);
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

  // Mostrar banner si el hook devuelve un error
  useEffect(() => {
    if (error) showBanner(error);
  }, [error]);

  return (
    <ScreenContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Mis Documentos
          </Text>
        </View>

        {bannerMessage && (
          <Animated.View style={[styles.errorBox, { opacity }] }>
            <Text style={styles.errorText}>{bannerMessage}</Text>
          </Animated.View>
        )}

        {/* SUBIR PDF */}
        <View style={styles.uploadSection}>
          <View style={styles.appLogo}>
            <Text style={styles.appLogoEmoji}>🤖</Text>
          </View>
          {/* Input web o botón nativo */}
          {Platform.OS === 'web' ? (
            <input
              type="file"
              accept="application/pdf"
              style={{ marginBottom: 12, fontSize: 16 }}
              onChange={handleWebInputChange}
              data-cy="input-pdf"
            />
          ) : (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.disabled]}
              onPress={handlePickDocument}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>Seleccionar PDF</Text>
            </TouchableOpacity>
          )}
          {/* Mostrar nombre del archivo seleccionado */}
          {selectedFile && (
            <Text style={{ marginVertical: 8, color: '#333', fontSize: 15 }}>
              Archivo seleccionado: {selectedFile.name}
            </Text>
          )}
          {/* Botón para subir el archivo seleccionado */}
          <TouchableOpacity
            style={[styles.uploadButton, (!selectedFile || uploading) && styles.disabled]}
            onPress={handleUploadDocument}
            disabled={!selectedFile || uploading}
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
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.document_id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.documentItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleSelectDocument(item)}
              >
                <Text style={[styles.documentName, { color: colors.text }]}>
                  {item.file_name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 56,
    borderBottomWidth: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },

  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
  },

  errorText: {
    color: '#991b1b',
    textAlign: 'center',
  },

  uploadSection: {
    padding: 16,
    alignItems: 'center',
  },

  uploadButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 14,
    width: '95%',
    alignItems: 'center',
  },

  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.6,
  },

  listContent: {
    padding: 16,
  },

  appLogo: {
    width: 120,
    height: 120,
    marginBottom: 12,
    borderRadius: 12,
  },
  appLogoEmoji: {
    fontSize: 56,
    textAlign: 'center',
    lineHeight: 72,
  },

  documentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  documentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
});
