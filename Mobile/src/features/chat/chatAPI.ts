import axiosInstance from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import { Conversation, Message, SendMessagePayload } from './chatTypes';

export const chatAPI = {
  getConversations: () =>
    axiosInstance.get<Conversation[]>(ENDPOINTS.CHAT.CONVERSATIONS),

  getMessages: (conversationId: string) =>
    axiosInstance.get<Message[]>(ENDPOINTS.CHAT.MESSAGES(conversationId)),

  sendMessage: (data: SendMessagePayload) =>
    axiosInstance.post<Message>(ENDPOINTS.CHAT.MESSAGES(data.conversationId), {
      text: data.text,
    }),

  markAsRead: (conversationId: string) =>
    axiosInstance.patch(ENDPOINTS.CHAT.MARK_READ(conversationId)),
};