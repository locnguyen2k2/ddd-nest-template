import { Injectable } from '@nestjs/common';
import {
    LoginArgs,
    LogoutArgs,
    RefreshTokenArgs,
    VerifyAccessTokenArgs,
} from '../../dtos/commands/auth-cmd.dto';
import { AuthDomainService } from '@/modules/iam/domain/services/auth.service';
import { AuthResponseDto, TokenResponseDto, UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { AuthMapper } from '@/modules/iam/infrastructure/persistence/mappers/auth.mapper';

@Injectable()
export class AuthCmdHandler {
    constructor(private readonly authDomainService: AuthDomainService) { }

    async login(args: LoginArgs, orgID: string): Promise<AuthResponseDto> {
        try {
            const validUser = await this.authDomainService.validateUser(args.username, args.password, orgID);
            const { refresh_token, access_token, expires_in } = await this.authDomainService.prepareTokens(validUser);
            return AuthMapper.toResponseDto(expires_in, refresh_token, access_token, validUser);
        } catch (error) {
            throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, 'Login failed');
        }
    }

    async logout(userId: string, args: LogoutArgs): Promise<void> {
        await this.authDomainService.logout(
            userId,
            args.accessToken,
            args.refreshToken,
        );
    }

    async refreshToken(args: RefreshTokenArgs): Promise<TokenResponseDto> {
        return await this.authDomainService.refreshToken(args.refreshToken);
    }

    async verifyAccessToken(args: VerifyAccessTokenArgs): Promise<UserResponseDto> {
        return await this.authDomainService.verifyAccessToken(args.accessToken);
    }
}
