import { Inject, Injectable } from '@nestjs/common';
import {
  LoginArgs,
  LogoutArgs,
  RefreshTokenArgs,
  VerifyAccessTokenArgs,
} from '../../dtos/commands/auth-cmd.dto';
import {
  AuthResponseDto,
  CaptchaResponseDto,
  TokenResponseDto,
  UserResponseDto,
} from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { AuthMapper } from '@/modules/iam/infrastructure/persistence/mappers/auth.mapper';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { AuthWrapperCmdHandler } from './wrapper.command.handler';
import { LogCmdHandler } from '@/modules/system/logs/application/services/log/command.handler';
import { CreateLogDto } from '@/modules/system/logs/application/dtos/create-log.dto';
import { HttpMethod, LogLevel, LogStatus, LogType } from '@/modules/system/logs/domain/log.enum';

@Injectable()
export class AuthCmdHandler {
  constructor(
    private readonly authWrapperCmdHandler: AuthWrapperCmdHandler,
    @Inject(ORGANIZATION_REPO)
    private readonly orgRepo: IOrganizationRepository,
    private readonly loggerCmd: LogCmdHandler,
  ) { }

  @LogExecutionTime()
  async reCaptcha(): Promise<CaptchaResponseDto> {
    return await this.authWrapperCmdHandler.reCaptcha();
  }

  @LogExecutionTime()
  async login(args: LoginArgs): Promise<AuthResponseDto> {
    try {
      const [validUser, isCaptchaValid] = await Promise.all([
        this.authWrapperCmdHandler.validateUser(args.username, args.password),
        this.authWrapperCmdHandler.verifyCaptcha(args.captchaId, args.captcha),
      ]);
      if (!isCaptchaValid) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          'Captcha invalid',
        );
      }
      const [tokenInfo, orgs] = await Promise.all([
        this.authWrapperCmdHandler.prepareTokens(validUser),
        this.orgRepo.findByIds(
          validUser.organizations.map((org) => org.organization_id),
        ),
      ]);
      const orgsPrisma = orgs.map((org) => OrganizationMapper.toPrisma(org));
      const logArgs: CreateLogDto = {
        created_by: validUser.id.value,
        context: 'auth',
        type: LogType.USER,
        status: LogStatus.SUCCESS,
        level: LogLevel.INFO,
        is_http: true,
        http_method: HttpMethod.POST,
        path: '/auth/login',
        status_code: 200,
        action: 'login',
        reason: 'User logged in',
        attributes: {},
        before: {},
        after: {},
        duration: 0,
        service: 'auth',
      };
      this.loggerCmd.create(logArgs);
      return AuthMapper.toResponseDto(tokenInfo, validUser, orgsPrisma);
    } catch (error) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        'Login failed',
      );
    }
  }

  @LogExecutionTime()
  async logout(userId: string, args: LogoutArgs): Promise<void> {
    await this.authWrapperCmdHandler.logout(
      userId,
      args.accessToken,
      args.refreshToken,
    );
  }

  @LogExecutionTime()
  async refreshToken(args: RefreshTokenArgs): Promise<TokenResponseDto> {
    return await this.authWrapperCmdHandler.refreshToken(args.refreshToken);
  }

  @LogExecutionTime()
  async verifyAccessToken(
    args: VerifyAccessTokenArgs,
  ): Promise<UserResponseDto> {
    return await this.authWrapperCmdHandler.verifyAccessToken(args.accessToken);
  }
}
