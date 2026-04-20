import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, Animated,
} from 'react-native';
import Colors from '../../contants/colors';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { sendChatbotMessage } from '../../features/chat/chatThunks';
import { addUserMessage, clearChat, selectChatMessages, selectChatbotLoading } from '../../features/chat/chatSlice';
import { ChatMessage } from '../../features/chat/chatTypes';

const theme = Colors.light;

// ─── Quick reply chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = ['Services', 'Prices', 'Book now', 'Add-ons', 'Contact'];

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]}
        />
      ))}
    </View>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ item: ChatMessage }> = ({ item }) => {
  const isUser = item.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        isUser ? styles.userRow : styles.botRow,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>D</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ChatScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const dispatch  = useAppDispatch();
  const messages  = useAppSelector(selectChatMessages);
  const loading   = useAppSelector(selectChatbotLoading);

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    dispatch(addUserMessage(msg));
    dispatch(sendChatbotMessage(msg));
    setInput('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>D</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>Dames Assistant</Text>
          <Text style={styles.headerStatus}>● Online</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(clearChat())} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Messages ────────────────────────────────────────────── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* ── Quick replies ────────────────────────────────────────── */}
        {!loading && (
          <View style={styles.quickRow}>
            {QUICK_REPLIES.map(q => (
              <TouchableOpacity key={q} style={styles.quickChip} onPress={() => handleSend(q)} activeOpacity={0.75}>
                <Text style={styles.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input bar ────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.mutedText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!loading}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() && !loading ? theme.primary : theme.lavenderLight }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.sendIcon}>↑</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.navyDark,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn:    { marginRight: 4 },
  backIcon:   { fontSize: 22, color: '#fff', fontWeight: '600' },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerName:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerStatus: { color: '#6EE7B7', fontSize: 12, fontWeight: '500', marginTop: 1 },
  clearBtn:     { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' },
  clearBtnText: { color: '#BDC2DB', fontSize: 12, fontWeight: '600' },

  // Messages
  messageList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  bubbleRow:  { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  userRow:    { justifyContent: 'flex-end' },
  botRow:     { justifyContent: 'flex-start' },

  avatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  bubble:      { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble:  { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  botBubble:   { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.lavenderLight },
  bubbleText:  { fontSize: 15, lineHeight: 22 },
  userText:    { color: '#fff' },
  botText:     { color: theme.textPrimary },

  // Typing indicator
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 16 },
  dot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.primary },

  // Quick replies
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: theme.primary, backgroundColor: theme.card,
  },
  quickChipText: { color: theme.primary, fontSize: 13, fontWeight: '600' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: theme.lavenderLight,
    backgroundColor: theme.background,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    backgroundColor: theme.card,
    borderRadius: 22, borderWidth: 1.5, borderColor: theme.lavenderLight,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: theme.textPrimary,
  },
  sendBtn:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});

export default ChatScreen;