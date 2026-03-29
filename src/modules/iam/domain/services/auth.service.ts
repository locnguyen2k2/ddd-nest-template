import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPort, JWT_PORT } from '@/shared/application/ports/jwt.port';
import { ConfigKeyPaths, IJwtConfig, jwtConfigKey } from '@/config';
import {
    ISessionRepository,
    ITokenBlacklistRepository,
    SESSION_REPO,
    TOKEN_BLACKLIST_REPO,
} from '../repositories/auth.repository';
import { IUserRepository, USER_REPO } from '../repositories/user.repository';
import { UserService } from './user.service';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import {
    AuthResponseDto,
    TokenResponseDto,
    UserResponseDto,
} from '../../presentation/dtos/res/user-response.dto';

@Injectable()
export class AuthDomainService {
    private readonly jwtConfigs: IJwtConfig;

    constructor(
        private readonly configService: ConfigService<ConfigKeyPaths>,
        @Inject(JWT_PORT) private readonly jwtPort: JwtPort,
        @Inject(USER_REPO) private readonly userRepo: IUserRepository,
        @Inject(SESSION_REPO) private readonly sessionRepo: ISessionRepository,
        @Inject(TOKEN_BLACKLIST_REPO)
        private readonly blacklistRepo: ITokenBlacklistRepository,
        private readonly userService: UserService,
    ) {
        this.jwtConfigs = this.configService.get<IJwtConfig>(jwtConfigKey)!;
    }

    async login(username: string, password: string): Promise<AuthResponseDto> {
        const user = await this.userRepo.findByUsernameOrEmail(username);
        if (!user) {
            throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
        }

        await this.userService.compareAndHash(password, user.password());

        const tokens = await this.generateTokens({
            sub: user.id.value,
            email: user.email(),
            username: user.username(),
        });

        const ttl = this.convertExpiresInToSeconds(
            this.jwtConfigs.refreshExpiresIn,
        );
        await this.sessionRepo.createSession(user.id.value, ttl);

        return new AuthResponseDto(
            new UserResponseDto(
                user.id.value,
                user.email(),
                user.username(),
                user.firstName(),
                user.lastName(),
                user.status(),
                user.createdAt(),
                user.updatedAt(),
            ),
            new TokenResponseDto(
                tokens.accessToken,
                tokens.refreshToken,
                this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn),
                'Bearer',
            ),
        );
    }

    async logout(
        userId: string,
        accessToken: string,
        refreshToken: string,
    ): Promise<void> {
        await this.sessionRepo.deleteSession(userId);

        const accessTtl = this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn);
        const refreshTtl = this.convertExpiresInToSeconds(
            this.jwtConfigs.refreshExpiresIn,
        );

        await Promise.all([
            this.blacklistRepo.blacklistToken(accessToken, accessTtl),
            this.blacklistRepo.blacklistToken(refreshToken, refreshTtl),
        ]);
    }

    async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
        try {
            const payload = this.jwtPort.verify<{
                sub: string;
                email: string;
                username: string;
            }>(refreshToken, {
                secret: this.jwtConfigs.refreshSecret,
            });

            const isActive = await this.sessionRepo.isSessionActive(payload.sub);
            if (!isActive) {
                throw new BusinessException(ErrorEnum.UNAUTHORIZED);
            }

            const isBlacklisted =
                await this.blacklistRepo.isTokenBlacklisted(refreshToken);
            if (isBlacklisted) {
                throw new BusinessException(ErrorEnum.UNAUTHORIZED);
            }

            const tokens = await this.generateTokens({
                sub: payload.sub,
                email: payload.email,
                username: payload.username,
            });

            // Blacklist the old refresh token
            const refreshTtl = this.convertExpiresInToSeconds(
                this.jwtConfigs.refreshExpiresIn,
            );
            await this.blacklistRepo.blacklistToken(refreshToken, refreshTtl);

            return new TokenResponseDto(
                tokens.accessToken,
                tokens.refreshToken,
                this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn),
                'Bearer',
            );
        } catch (error) {
            throw new BusinessException(ErrorEnum.UNAUTHORIZED);
        }
    }

    async verifyAccessToken(accessToken: string): Promise<UserResponseDto> {
        try {
            const payload = this.jwtPort.verify<{
                sub: string;
                email: string;
                username: string;
            }>(accessToken, {
                secret: this.jwtConfigs.secret,
            });

            const isBlacklisted =
                await this.blacklistRepo.isTokenBlacklisted(accessToken);
            if (isBlacklisted) {
                throw new BusinessException(ErrorEnum.UNAUTHORIZED);
            }

            const user = await this.userRepo.findByID(payload.sub);
            if (!user) {
                throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
            }

            return new UserResponseDto(
                user.id.value,
                user.email(),
                user.username(),
                user.firstName(),
                user.lastName(),
                user.status(),
                user.createdAt(),
                user.updatedAt(),
            );
        } catch (error) {
            throw new BusinessException(ErrorEnum.UNAUTHORIZED);
        }
    }

    private async generateTokens(payload: any) {
        const accessToken = this.jwtPort.sign(payload, {
            secret: this.jwtConfigs.secret,
            expiresIn: this.jwtConfigs.expiresIn,
        });

        const refreshToken = this.jwtPort.sign(payload, {
            secret: this.jwtConfigs.refreshSecret,
            expiresIn: this.jwtConfigs.refreshExpiresIn,
        });

        return { accessToken, refreshToken };
    }

    private convertExpiresInToSeconds(expiresIn: string | number): number {
        if (typeof expiresIn === 'number') return expiresIn;

        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));

        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
            default:
                return value;
        }
    }

}
