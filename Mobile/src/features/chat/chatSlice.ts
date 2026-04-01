import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Message } from './chatTypes';
import { fetchConversations, fetchMessages, sendMessage, markConversationRead } from './chatThunks';
import { RootState } from '../../app/store';

const initialState: ChatState = {
  conversations:        [],
  activeConversationId: null,
  messages:             {},
  loading:              false,
  sending:              false,
  error:                null,
  socketConnected:      false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload;
    },
    clearActiveConversation(state) {
      state.activeConversationId = null;
    },
    clearChatError(state) {
      state.error = null;
    },

    // ── Socket hook-ins ──────────────────────────────────
    // Call these from your socket event handlers once you
    // integrate WebSockets (e.g. socket.io):
    //
    //   socket.on('message', (msg) => dispatch(socketMessageReceived(msg)))
    //   socket.on('connect',  ()  => dispatch(setSocketConnected(true)))
    //   socket.on('disconnect',() => dispatch(setSocketConnected(false)))

    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.socketConnected = action.payload;
    },

    socketMessageReceived(state, action: PayloadAction<Message>) {
      const msg  = action.payload;
      const conv = state.messages[msg.conversationId];
      if (conv) {
        conv.push(msg);
      } else {
        state.messages[msg.conversationId] = [msg];
      }
    },
  },
  extraReducers: (builder) => {
    // ── Fetch conversations ──────────────────────────────
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading       = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Fetch messages ───────────────────────────────────
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Send message ─────────────────────────────────────
    builder
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error   = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { conversationId, message } = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId].push(message);
        } else {
          state.messages[conversationId] = [message];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error   = action.payload as string;
      });

    // ── Mark read ────────────────────────────────────────
    builder
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const convId   = action.payload;
        const messages = state.messages[convId];
        if (messages) messages.forEach(m => { m.read = true; });
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  clearChatError,
  setSocketConnected,
  socketMessageReceived,
} = chatSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectConversations        = (state: RootState) => state.chat.conversations;
export const selectActiveConversationId = (state: RootState) => state.chat.activeConversationId;
export const selectMessages             = (conversationId: string) =>
  (state: RootState) => state.chat.messages[conversationId] ?? [];
export const selectChatLoading          = (state: RootState) => state.chat.loading;
export const selectChatSending          = (state: RootState) => state.chat.sending;
export const selectChatError            = (state: RootState) => state.chat.error;
export const selectSocketConnected      = (state: RootState) => state.chat.socketConnected;

export default chatSlice.reducer;