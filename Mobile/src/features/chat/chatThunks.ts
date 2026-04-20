import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatbotAPI } from './chatAPI';

export const sendChatbotMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      const { data } = await chatbotAPI.sendMessage({ message });
      return data.reply;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to get a response.');
    }
  }
);