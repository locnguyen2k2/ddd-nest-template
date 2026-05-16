export const SESSION_REPO = 'SESSION_REPOSITORY';
export const TOKEN_BLACKLIST_REPO = 'TOKEN_BLACKLIST_REPOSITORY';
export const CAPTCHA_REPO = 'CAPTCHA_REPOSITORY';

export interface ISessionRepository {
  createSession(userId: string, ttl: number): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  isSessionActive(userId: string): Promise<boolean>;
}

export interface ITokenBlacklistRepository {
  blacklistToken(token: string, ttl: number): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
}

export interface ICaptchaRepository {
  getCaptcha(): Promise<{ captchaId: string; captcha: string }>;
  confirmedCaptcha(data: { captchaId: string; captcha: string }): Promise<void>;
}