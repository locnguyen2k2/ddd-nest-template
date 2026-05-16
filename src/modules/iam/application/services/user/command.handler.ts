import { USER_REPO } from '@/modules/iam/domain/repositories/user.repository';
import { UserRepository } from '@/modules/iam/infrastructure/persistence/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  RegisterUserArgs,
  UpdateProfileArgs,
} from '../../dtos/commands/auth-cmd.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { uuidv7 } from 'uuidv7';
import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { UserService } from '@/modules/iam/domain/services/user.service';
import { BusinessException } from '@/common/http/business-exception';
import {
  AuthResponseDto,
  UserResponseDto,
} from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { Password } from '@/modules/iam/domain/vo/password.vo';
import { AuthMapper } from '@/modules/iam/infrastructure/persistence/mappers/auth.mapper';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { AuthWrapperCmdHandler } from '../auth/wrapper.command.handler';
import { UserEventPublisher } from '@/modules/iam/infrastructure/events/user.event-publisher';
import { AccessControlStatus } from '@/common/enum';

@Injectable()
export class UserCmdHandler {
  constructor(
    @Inject(USER_REPO) private readonly userRepo: UserRepository,
    private readonly userService: UserService,
    private readonly authService: AuthWrapperCmdHandler,
    @Inject(ORGANIZATION_REPO)
    private readonly orgRepo: IOrganizationRepository,
    private readonly userEventPublisher: UserEventPublisher,
  ) { }

  async register(args: RegisterUserArgs): Promise<AuthResponseDto> {
    const _id = uuidv7();
    const id: IEntityID<string> = {
      value: _id,
      _id,
      get: () => _id,
    };
    const hashedPassword = this.authService.hash(args.password);
    const password: Password = Password.create(hashedPassword);

    if (
      !this.userService.isUsername(args.username) &&
      !this.userService.isEmail(args.username)
    ) {
      throw new BusinessException('400|Invalid username');
    }
    if (!this.userService.isEmail(args.email)) {
      throw new BusinessException('400|Invalid email');
    }

    const [isUsernameExisted, isEmailExisted, isCaptchaValid] = await Promise.all([
      this.userRepo.findByUsername(args.username),
      this.userRepo.findByEmail(args.email),
      this.authService.verifyCaptcha(args.captchaId, args.captcha),
    ]);

    if (isUsernameExisted !== null) {
      throw new BusinessException('400|Username is already taken');
    }
    if (isEmailExisted !== null) {
      throw new BusinessException('400|Email is already taken');
    }
    if (!isCaptchaValid) {
      throw new BusinessException('400|Captcha invalid');
    }

    const userDomain = UserEntity.create({
      id,
      email: args.email,
      password,
      first_name: args.first_name,
      last_name: args.last_name,
      username: args.username,
      status: AccessControlStatus.INACTIVE,
      organizations: [],
    });

    const user = await this.userRepo.create(userDomain);
    await this.userEventPublisher.publishEvents([...user.getEvents()]);
    user.clearEvents();

    const [tokensInfo, orgs] = await Promise.all([
      this.authService.prepareTokens(user),
      this.orgRepo.findByIds(
        user.organizations.map((org) => org.organization_id),
      ),
    ]);

    const orgsPrisma = orgs.map((org) => OrganizationMapper.toPrisma(org));
    return AuthMapper.toResponseDto(tokensInfo, user, orgsPrisma);
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
