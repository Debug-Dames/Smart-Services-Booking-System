// Matches the user object returned by both /auth/login and /auth/register
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
}

// POST /auth/login  →  { message, token, user }
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// POST /auth/register  →  { message, user }  (no token — user redirected to Login)
export interface RegisterResponse {
  message: string;
  user: User;
}

// GET /auth/me  →  { user }
export interface ProfileResponse {
  user: User;
}

// What we store in Redux
export interface AuthState {
  user:    User | null;
  token:   string | null;
  loading: boolean;
  error:   string | null;
}

// Thunk payloads
export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
  phone?:   string;
  gender?:  string;
}