export const ENDPOINTS = {

  // ── Auth ──────────────────────────────────────────────
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT:   '/auth/logout',
    ME:       '/auth/me',
  },

  // ── Services ──────────────────────────────────────────
  SERVICES: {
    ALL:         '/services',
    BY_ID:       (id: string) => `/services/${id}`,
    BY_CATEGORY: (category: string) => `/services?category=${category}`,
  },

  // ── Bookings ──────────────────────────────────────────
  BOOKINGS: {
    ALL:    '/bookings',
    BY_ID:  (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },

  // ── Payments ──────────────────────────────────────────
  PAYMENTS: {
    ALL:    '/payments',
    BY_ID:  (id: string) => `/payments/${id}`,
  },

  // ── Chat ──────────────────────────────────────────────
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES:      (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    MARK_READ:     (conversationId: string) => `/chat/conversations/${conversationId}/read`,
  },

  // ── Chatbot ───────────────────────────────────────────────
  CHATBOT: {
    CHAT: '/chatbot/chat',
  },

} as const;