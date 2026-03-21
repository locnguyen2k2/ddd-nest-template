import { Module } from "@nestjs/common";
import { FeatureController } from "./presentation/controllers/feature.controller";
import { RoleController } from "./presentation/controllers/role.controller";
import { OrganizationController } from "./presentation/controllers/organization.controller";
import { FeatureQueryHandler } from "@/modules/iam/application/services/feature/feature.query.handler";
import { RoleQueryHandler } from "@/modules/iam/application/services/role/role.query.handler";
import { RoleCommandHandler } from "@/modules/iam/application/services/role/role.command.handler";
import { OrganizationCommandHandler } from "@/modules/iam/application/services/organization/command.handler";
import { OrganizationQueryHandler } from "@/modules/iam/application/services/organization/query.handler";
import { FeatureRepository } from "./infrastructure/persistence/repositories/feature.repository";
import { RoleRepository } from "./infrastructure/persistence/repositories/role.repository";
import { OrganizationRepository } from "./infrastructure/persistence/repositories/organization.repository";
import { FeatureEventPublisher } from "./infrastructure/events/feature.event-publisher";
import { RoleEventPublisher } from "./infrastructure/events/role.event-publisher";
import { OrganizationEventPublisher } from "./infrastructure/events/organization.event-publisher";
import { FeatureCommandHandler } from "./application/services/feature/feature.command.handler";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { FEATURE_REPO } from "./domain/repositories/feature.repository";
import { ORGANIZATION_REPO } from "./domain/repositories/organization.repository";
import { ROLE_REPO } from "./domain/repositories/role.repository";
import { PermissionRepository } from "./infrastructure/persistence/repositories/permission.repository";
import { PermissionCmdHandler } from "./application/services/permission/permission.cmd.handler";
import { PERMISSION_REPO } from "./domain/repositories/permission.repository";

const featureProviders = [
    PrismaService,
    FeatureCommandHandler,
    FeatureRepository,
    FeatureQueryHandler,
    FeatureEventPublisher,
    {
        provide: FEATURE_REPO,
        useClass: FeatureRepository,
    }
];
const roleProviders = [
    RoleCommandHandler,
    RoleQueryHandler,
    RoleRepository,
    RoleEventPublisher,
    {
        provide: ROLE_REPO,
        useClass: RoleRepository,
    }
];
const organizationProviders = [
    OrganizationCommandHandler,
    OrganizationQueryHandler,
    OrganizationRepository,
    OrganizationEventPublisher,
    {
        provide: ORGANIZATION_REPO,
        useClass: OrganizationRepository,
    }
];
const permissionProviders = [
    PermissionRepository,
    PermissionCmdHandler,
    {
        provide: PERMISSION_REPO,
        useClass: PermissionRepository,
    }
];

const featureExports = [
    FeatureRepository,
    FeatureEventPublisher,
];
const roleExports = [
    RoleRepository,
    RoleEventPublisher,
];
const organizationExports = [
    OrganizationRepository,
    OrganizationEventPublisher,
];
const permissionExports = [
    PermissionRepository,
    PermissionCmdHandler,
];

@Module({
    imports: [],
    controllers: [FeatureController, RoleController, OrganizationController],
    providers: [
        ...featureProviders,
        ...roleProviders,
        ...organizationProviders,
        ...permissionProviders,
    ],
    exports: [
        ...featureExports,
        ...roleExports,
        ...organizationExports,
        ...permissionExports,
    ],
})
export class IamModule { }