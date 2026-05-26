import { REGEX } from '@/common/constant';
import { CacheAdapter } from '@/shared/infrastructure/adapters/cache.adapter';

export interface IConfirmationCode {
  code: string;
  expires_at: Date;
  user_id: string;
}

export class UserService {
  constructor(private readonly cache: CacheAdapter) { }

  public isEmail(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidEmail.test(value);
  }

  public isUsername(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidUsername.test(value);
  }
}
