export const JWT_PORT = 'JWT_PORT';

export interface JwtSignOptions {
  expiresIn?: string | number;
  secret?: string;
}

export interface JwtPort {
  sign(payload: any, options?: JwtSignOptions): string;
  verify<T extends object>(token: string, options?: { secret?: string }): T;
  decode<T>(token: string): T;
}
