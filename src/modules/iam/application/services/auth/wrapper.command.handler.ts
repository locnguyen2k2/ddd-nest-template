import { ConfigKeyPaths, IJwtConfig, jwtConfigKey } from "@/config";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtAdapter } from "@/shared/infrastructure/adapters/jwt.adapter";
import { UserRepository } from "@/modules/iam/infrastructure/persistence/repositories/user.repository";
import { SessionCacheRepository, TokenBlacklistCacheRepository } from "@/modules/iam/infrastructure/persistence/repositories/auth-cache.repository";
import { AuthDomainService } from "@/modules/iam/domain/services/auth.service";
import { UserEntity } from "@/modules/iam/domain/entities/user.entity";
import { TokenResponseDto } from "@/modules/iam/presentation/dtos/res/user-response.dto";
import { BcryptAdapter } from "@/shared/infrastructure/adapters/bcrypt.adapter";

export const AUTH_WRAPPER_CMD_HANDLER = 'AUTH_WRAPPER_CMD_HANDLER'
@Injectable()
export class AuthWrapperCmdHandler {
    private readonly domainService: AuthDomainService;
    private readonly jwtConfigs: IJwtConfig;

    constructor(
        private readonly configService: ConfigService<ConfigKeyPaths>,
        private readonly jwtPort: JwtAdapter,
        private readonly userRepo: UserRepository,
        private readonly sessionRepo: SessionCacheRepository,
        private readonly blacklistRepo: TokenBlacklistCacheRepository,
        private readonly bcryptAdapter: BcryptAdapter,
    ) {
        this.jwtConfigs = this.configService.get<IJwtConfig>(jwtConfigKey)!;
        this.domainService = new AuthDomainService(
            this.jwtConfigs,
            this.jwtPort,
            this.userRepo,
            this.sessionRepo,
            this.blacklistRepo,
            this.bcryptAdapter,
        );
    }

    async validateUser(username: string, password: string): Promise<UserEntity> {
        return await this.domainService.validateUser(username, password);
    }

    async prepareTokens(user: UserEntity): Promise<TokenResponseDto> {
        return this.domainService.prepareTokens(user);
    }

    async verifyAccessToken(token: string): Promise<any> {
        return this.domainService.verifyAccessToken(token);
    }

    async refreshToken(refreshToken: string): Promise<any> {
        return this.domainService.refreshToken(refreshToken);
    }

    async logout(userId: string,
        accessToken: string,
        refreshToken: string,): Promise<void> {
        return this.domainService.logout(userId, accessToken, refreshToken);
    }

    hash(password: string): string {
        return this.domainService.hash(password);
    }

    match(plainPassword: string, hashedPassword: string): boolean {
        return this.bcryptAdapter.comparePassword(plainPassword, hashedPassword);
    }

    validateCredentials(user: UserEntity, password: string) {
        return this.domainService.validateCredentials(user, password);
    }
}
