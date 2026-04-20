import axiosInstance from '../../api/axiosInstance';
import { ChatbotPayload, ChatbotResponse } from './chatTypes';

export const chatbotAPI = {
  sendMessage: (data: ChatbotPayload) =>
    axiosInstance.post<ChatbotResponse>('/chatbot/chat', data),
};