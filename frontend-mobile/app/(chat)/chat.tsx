import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDocumentsAndChat } from '@/src/hooks/useDocumentsAndChat';
import { Colors } from '@/constants/Colors';

export default function ChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { documentId, documentName } = useLocalSearchParams();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');

  const userId = user?.id || 'user-test';
  const { messages, loading, error, sendMessage } =
    useDocumentsAndChat(userId, documentId as string);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const textToSend = messageText;
    setMessageText('');

    try {
      await sendMessage(textToSend);
    } catch (err) {
      setMessageText(textToSend);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#a855f7', fontSize: 16 }}>Atras</Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {documentName || 'Chat'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {error && (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
          ]}
        >
          <Text style={{ color: '#991b1b', fontSize: 12 }}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Inicia el chat escribiendo una pregunta sobre el documento
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user'
                  ? styles.userMessage
                  : styles.assistantMessage,
                {
                  backgroundColor:
                    msg.role === 'user'
                      ? '#a855f7'
                      : colors.cardBackground,
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color:
                      msg.role === 'user'
                        ? '#fff'
                        : colors.text,
                  },
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))
        )}

        {loading && (
          <View style={styles.loadingMessage}>
            <ActivityIndicator color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>
              Generando respuesta...
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor={colors.muted}
          value={messageText}
          onChangeText={setMessageText}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (loading || !messageText.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={loading || !messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  errorBox: {
    margin: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingMessage: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});