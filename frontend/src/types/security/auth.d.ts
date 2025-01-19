interface AuthEvent {
  action: string;
  status: 'success' | 'failure';
  timestamp: number;
  details?: Record<string, unknown>;
}

declare class AuthManager {
  private static instance: AuthManager;
  private token: string | null;
  private sessionStartTime: number | null;
  private lastActivityTime: number | null;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }>;
  private readonly SESSION_TIMEOUT: number;
  private readonly MAX_LOGIN_ATTEMPTS: number;
  private readonly ATTEMPT_RESET_TIME: number;
  private readonly REAUTH_REQUIRED_TIME: number;

  private constructor();
  static getInstance(): AuthManager;
  private initializeFromStorage(): void;
  private handleStorageChange(event: StorageEvent): void;
  private validateTokenFormat(token: string): boolean;
  private checkXSS(input: string): boolean;
  setToken(token: string, expiresIn?: number): void;
  getToken(): string | null;
  startSession(): void;
  refreshSession(): void;
  isSessionActive(): boolean;
  requiresReauthentication(): boolean;
  logAuthEvent(event: AuthEvent): void;
  clearLoginAttempts(): void;
  private checkLoginAttempts(username: string): void;
  login(username: string, password: string): Promise<void>;
  logout(): void;
  private clearAuth(): void;
}

export const authManager: AuthManager;
export type { AuthEvent }; 