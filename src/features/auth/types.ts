export type AuthState = 'anonymous' | 'authenticating' | 'authenticated' | 'refreshing';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  avatarUrl?: string;
}

export interface GoogleAuthPayload {
  code?: string;
  credential?: string;
  state?: string;
  scope?: string;
  authuser?: string;
  prompt?: string;
  error?: string;
  callbackPath: string;
}
