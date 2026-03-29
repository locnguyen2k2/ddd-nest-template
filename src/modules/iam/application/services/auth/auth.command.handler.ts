import { Injectable } from '@nestjs/common';
import {
    LoginArgs,
    LogoutArgs,
    RefreshTokenArgs,
    VerifyAccessTokenArgs,
} from '../../dtos/commands/auth-cmd.dto';
import { AuthDomainService } from '@/modules/iam/domain/services/auth.service';
import { AuthResponseDto, TokenResponseDto, UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';

@Injectable()
export class AuthCmdHandler {
    constructor(private readonly authDomainService: AuthDomainService) { }

    async login(args: LoginArgs): Promise<AuthResponseDto> {
        return await this.authDomainService.login(args.username, args.password);
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
