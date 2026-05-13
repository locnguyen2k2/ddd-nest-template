import { REGEX } from '@/common/constant';
import { UserRepository } from '../../infrastructure/persistence/repositories/user.repository';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  public isEmail(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidEmail.test(value);
  }

  public isUsername(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidUsername.test(value);
  }
}
