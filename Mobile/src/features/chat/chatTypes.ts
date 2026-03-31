export interface ChatMessage {
  id:        string;
  role:      'user' | 'bot';
  text:      string;
  timestamp: number;
}

export interface ChatbotState {
  messages: ChatMessage[];
  loading:  boolean;
  error:    string | null;
}

export interface ChatbotPayload {
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}