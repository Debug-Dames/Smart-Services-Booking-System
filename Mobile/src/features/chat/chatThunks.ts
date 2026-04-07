import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from './chatAPI';
import { SendMessagePayload } from './chatTypes';

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await chatAPI.getConversations();
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load conversations.');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const { data } = await chatAPI.getMessages(conversationId);
      return { conversationId, messages: data };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load messages.');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { rejectWithValue }) => {
    try {
      const { data } = await chatAPI.sendMessage(payload);
      return { conversationId: payload.conversationId, message: data };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to send message.');
    }
  }
);

export const markConversationRead = createAsyncThunk(
  'chat/markRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await chatAPI.markAsRead(conversationId);
      return conversationId;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to mark as read.');
    }
  }
);