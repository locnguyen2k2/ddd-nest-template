import { USER_REPO } from '@/modules/iam/domain/repositories/user.repository';
import { UserRepository } from '@/modules/iam/infrastructure/persistence/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserArgs, UpdateProfileArgs } from '../../dtos/commands/user-cmd.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { uuidv7 } from 'uuidv7';
import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { UserService } from '@/modules/iam/domain/services/user.service';
import { BusinessException } from '@/common/http/business-exception';
import { AuthResponseDto, UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { AuthDomainService } from '@/modules/iam/domain/services/auth.service';
import { Password } from '@/modules/iam/domain/vo/password.vo';
import { AuthMapper } from '@/modules/iam/infrastructure/persistence/mappers/auth.mapper';

@Injectable()
export class UserCmdHandler {
  constructor(
    @Inject(USER_REPO) private readonly userRepo: UserRepository,
    private readonly userService: UserService,
    private readonly authService: AuthDomainService,
  ) { }

  async register(args: RegisterUserArgs): Promise<AuthResponseDto> {
    const _id = uuidv7();
    const id: IEntityID<string> = {
      value: _id,
      _id,
      get: () => _id,
    };
    const password: Password = Password.hash(args.password);

    const [isUsernameExisted, isEmailExisted] =
      await Promise.all([
        await this.userService.usernameIsExisted(args.username),
        await this.userRepo.findByEmail(args.email),
      ]);

    switch (true) {
      case isUsernameExisted:
        throw new BusinessException('400|Username is already taken');
      case !!isEmailExisted:
        throw new BusinessException('400|Email is already taken');
    }

    const userDomain = UserEntity.create({
      id,
      email: args.email,
      password,
      first_name: args.first_name,
      last_name: args.last_name,
      username: args.username,
    });

    await this.userRepo.create(userDomain);

    const { refresh_token, access_token, expires_in } = await this.authService.prepareTokens(userDomain);
    return AuthMapper.toResponseDto(expires_in, refresh_token, access_token, userDomain);
  }

  async updateProfile(args: UpdateProfileArgs): Promise<UserResponseDto> {
    try {
      return {} as UserResponseDto;
    } catch (e: any) {
      console.dir(e?.message);
      throw new BusinessException(`400|Failed to update profile`);
    }
  }
}
