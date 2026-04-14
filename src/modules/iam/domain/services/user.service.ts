import { REGEX } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';
import { UserRepository } from '../../infrastructure/persistence/repositories/user.repository';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  private isEmail(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidEmail.test(value);
  }

  private isUsername(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidUsername.test(value);
  }

  async usernameIsExisted(username: string): Promise<boolean> {
    if (!this.isUsername(username) && !this.isEmail(username)) {
      throw new BusinessException('400|Invalid username');
    }
    const user = await this.userRepository.findByUsername(username);
    return user !== null;
  }

  async emailIsExisted(email: string): Promise<boolean> {
    if (!this.isEmail(email)) {
      throw new BusinessException('400|Invalid email');
    }
    const user = await this.userRepository.findByEmail(email);
    return user !== null;
  }
}
