import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPO } from '../repositories/user.repository';
import { REGEX } from '@/common/constant';
import * as bcrypt from 'bcrypt';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPO) private readonly userRepository: IUserRepository,
  ) {}

  private isEmail(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidEmail.test(value);
  }

  private isUsername(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidUsername.test(value);
  }

  private async validatePassword(password: string): Promise<boolean> {
    const validate = (value: string) => {
      return typeof value === 'string' && REGEX.regValidPassword.test(value);
    };
    const isValid = validate(password);
    if (!isValid) {
      throw new BusinessException('400|Invalid password');
    }
    return true;
  }

  async usernameIsExisted(username: string): Promise<boolean> {
    if (!this.isUsername(username) && !this.isEmail(username)) {
      throw new BusinessException('400|Invalid username');
    }
    const user = await this.userRepository.findByUsernameOrEmail(username);
    return user !== null;
  }

  async hashPassword(password: string): Promise<string> {
    await this.validatePassword(password);
    const salt = 10;
    return (await bcrypt.hash(password, salt)) as string;
  }

  async compareAndHash(
    password: string,
    hashedPassword: string,
  ): Promise<string> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new BusinessException(ErrorEnum.PASSWORD_INCORRECT);
    }
    return await this.hashPassword(password);
  }
}
