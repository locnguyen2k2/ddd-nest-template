export const SESSION_REPO = 'SESSION_REPOSITORY';
export const TOKEN_BLACKLIST_REPO = 'TOKEN_BLACKLIST_REPOSITORY';

export interface ISessionRepository {
  createSession(userId: string, ttl: number): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  isSessionActive(userId: string): Promise<boolean>;
}

export interface ITokenBlacklistRepository {
  blacklistToken(token: string, ttl: number): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
}
