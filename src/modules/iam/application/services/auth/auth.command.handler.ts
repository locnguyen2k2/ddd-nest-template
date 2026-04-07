import { Inject, Injectable } from '@nestjs/common';
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
import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.repository';
import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { RoleMapper } from '@/modules/iam/infrastructure/persistence/mappers/role.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class AuthCmdHandler {
    constructor(private readonly authDomainService: AuthDomainService, @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository, @Inject(ORGANIZATION_REPO) private readonly orgRepo: IOrganizationRepository) { }

    @LogExecutionTime()
    async login(args: LoginArgs): Promise<AuthResponseDto> {
        try {
            const validUser = await this.authDomainService.validateUser(args.username, args.password);
            const [tokenInfo, orgs, roles] = await Promise.all([
                this.authDomainService.prepareTokens(validUser),
                this.orgRepo.findByIds(validUser.org_roles.map(org => org.organization_id)),
                this.roleRepo.findByIds(validUser.org_roles.flatMap(org => org.role_ids))
            ]);
            const orgsPrisma = orgs.map(org => OrganizationMapper.toPrisma(org));
            const rolesPrisma = roles.map(role => RoleMapper.toPrisma(role));
            return AuthMapper.toResponseDto(tokenInfo, validUser, orgsPrisma, rolesPrisma);
        } catch (error) {
            throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, 'Login failed');
        }
    }

    @LogExecutionTime()
    async logout(userId: string, args: LogoutArgs): Promise<void> {
        await this.authDomainService.logout(
            userId,
            args.accessToken,
            args.refreshToken,
        );
    }

    @LogExecutionTime()
    async refreshToken(args: RefreshTokenArgs): Promise<TokenResponseDto> {
        return await this.authDomainService.refreshToken(args.refreshToken);
    }

    @LogExecutionTime()
    async verifyAccessToken(args: VerifyAccessTokenArgs): Promise<UserResponseDto> {
        return await this.authDomainService.verifyAccessToken(args.accessToken);
    }
}
