export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface SendMessagePayload {
  conversationId: string;
  text: string;
}

export interface ChatState {
  conversations:   Conversation[];
  activeConversationId: string | null;
  messages:        Record<string, Message[]>; // keyed by conversationId
  loading:         boolean;
  sending:         boolean;
  error:           string | null;
  // Socket hook-in: set to true once socket is connected
  socketConnected: boolean;
}