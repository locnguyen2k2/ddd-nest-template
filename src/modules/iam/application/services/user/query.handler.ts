import { Inject, Injectable } from "@nestjs/common";
import { USER_REPO, IUserRepository } from "@/modules/iam/domain/repositories/user.repository";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";
import { ORGANIZATION_REPO, IOrganizationRepository } from "@/modules/iam/domain/repositories/organization.repository";
import { UserMapper } from "@/modules/iam/infrastructure/persistence/mappers/user.mapper";
import { OrganizationMapper } from "@/modules/iam/infrastructure/persistence/mappers/organization.mapper";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";

@Injectable()
export class UserQueryHandler {
    constructor(
        @Inject(USER_REPO) private readonly userRepository: IUserRepository,
        @Inject(ORGANIZATION_REPO) private readonly organizationRepository: IOrganizationRepository,
    ) { }

    @LogExecutionTime()
    async profile(userId: string) {
        const user = await this.userRepository.findByIdWithOrganizations(userId);
        if (!user) {
            throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
        }
        
        const orgsEntity = await this.organizationRepository.findByIds(
            user.organizations.map(org => org.organization_id)
        );

        const orgsToPrisma = orgsEntity.map(org => OrganizationMapper.toPrisma(org));

        return UserMapper.toResponseDto(user, orgsToPrisma);
    }
}
