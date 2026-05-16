export const BCRYPT_PORT = 'BCRYPT_PORT';
export interface BcryptPort {
  hashPassword(password: string, salt?: number): string;
  comparePassword(password: string, hash: string): boolean;
}
