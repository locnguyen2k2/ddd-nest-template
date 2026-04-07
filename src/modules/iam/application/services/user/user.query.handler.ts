import { Inject, Injectable } from "@nestjs/common";
import { USER_REPO, IUserRepository } from "@/modules/iam/domain/repositories/user.repository";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";
import { ORGANIZATION_REPO, IOrganizationRepository } from "@/modules/iam/domain/repositories/organization.repository";
import { UserService } from "@/modules/iam/domain/services/user.service";
import { PermissionAction } from "@/common/enum";
import { PROJECT_REPO, IProjectRepository } from "@/modules/iam/domain/repositories/project.repository";
import { ROLE_REPO, IRoleRepository } from "@/modules/iam/domain/repositories/role.repository";
import { UserMapper } from "@/modules/iam/infrastructure/persistence/mappers/user.mapper";
import { OrganizationMapper } from "@/modules/iam/infrastructure/persistence/mappers/organization.mapper";
import { RoleMapper } from "@/modules/iam/infrastructure/persistence/mappers/role.mapper";
import { FEATURE_REPO, IFeatureRepository } from "@/modules/iam/domain/repositories/feature.repository";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";

@Injectable()
export class UserQueryHandler {
    constructor(private readonly userService: UserService,
        @Inject(USER_REPO) private readonly userRepository: IUserRepository,
        @Inject(ORGANIZATION_REPO) private readonly organizationRepository: IOrganizationRepository,
        @Inject(ROLE_REPO) private readonly roleRepository: IRoleRepository,
        @Inject(PROJECT_REPO) private readonly projectRepository: IProjectRepository,
        @Inject(FEATURE_REPO) private readonly featureRepository: IFeatureRepository
    ) { }

    @LogExecutionTime()
    async hasPermission(userId: string, permissions: string[], onProjectID: string): Promise<boolean> {
        const permission = permissions[0];
        const project = await this.projectRepository.findById(onProjectID);
        if (!project) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization not found');
        const onOrgID = project.organizationID;
        const [featureKey, actionKey] = permission.split(':');
        const [user, feature] = await Promise.all([
            this.userRepository.findByIDWithOrgRoles(userId, onOrgID),
            this.featureRepository.findOneBySlug(featureKey, onProjectID)
        ]);

        if (!user) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);

        return await this.userService.canAccess(feature?.id.value, actionKey.toUpperCase() as PermissionAction, onProjectID);
    }

    @LogExecutionTime()
    async profile(userId: string) {
        const [user] = await Promise.all([
            this.userRepository.findOrgRoles(userId),
        ]);
        if (!user) {
            throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
        }
        const [orgsEntity, rolesEntity] = await Promise.all([
            this.organizationRepository.findByIds(user.org_roles.map(org => org.organization_id)),
            this.roleRepository.findByIds(user.org_roles.flatMap(org => org.role_ids)),
        ]);

        const orgsToPrisma = orgsEntity.map(org => OrganizationMapper.toPrisma(org));
        const rolesToPrisma = rolesEntity.map(role => RoleMapper.toPrisma(role));

        return UserMapper.toResponseDto(user, orgsToPrisma, rolesToPrisma);
    }
}
