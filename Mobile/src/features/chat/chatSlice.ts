import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatbotState, ChatMessage } from './chatTypes';
import { sendChatbotMessage } from './chatThunks';
import { RootState } from '../../app/store';

const WELCOME: ChatMessage = {
  id:        'welcome',
  role:      'bot',
  text:      "Hello! 👋 Welcome to Dames Salon. How can I help you today?\n\nYou can ask me about services, prices, bookings, or anything else!",
  timestamp: Date.now(),
};

const initialState: ChatbotState = {
  messages: [WELCOME],
  loading:  false,
  error:    null,
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id:        Date.now().toString(),
        role:      'user',
        text:      action.payload,
        timestamp: Date.now(),
      });
    },
    clearChat(state) {
      state.messages = [WELCOME];
      state.error    = null;
    },
    clearChatbotError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatbotMessage.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(sendChatbotMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id:        Date.now().toString(),
          role:      'bot',
          text:      action.payload,
          timestamp: Date.now(),
        });
      })
      .addCase(sendChatbotMessage.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
        state.messages.push({
          id:        Date.now().toString(),
          role:      'bot',
          text:      "Sorry, I couldn't connect. Please try again.",
          timestamp: Date.now(),
        });
      });
  },
});

export const { addUserMessage, clearChat, clearChatbotError } = chatbotSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectChatMessages    = (state: RootState) => state.chat.messages;
export const selectChatbotLoading  = (state: RootState) => state.chat.loading;
export const selectChatbotError    = (state: RootState) => state.chat.error;

export default chatbotSlice.reducer;