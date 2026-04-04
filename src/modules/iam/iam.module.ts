import { Module } from '@nestjs/common';
import { FeatureController } from './presentation/controllers/feature.controller';
import { RoleController } from './presentation/controllers/role.controller';
import { OrganizationController } from './presentation/controllers/organization.controller';
import { UserController } from './presentation/controllers/user.controller';
import { FeatureQueryHandler } from '@/modules/iam/application/services/feature/feature.query.handler';
import { RoleQueryHandler } from '@/modules/iam/application/services/role/role.query.handler';
import { RoleCommandHandler } from '@/modules/iam/application/services/role/role.command.handler';
import { OrganizationCommandHandler } from '@/modules/iam/application/services/organization/command.handler';
import { OrganizationQueryHandler } from '@/modules/iam/application/services/organization/query.handler';
import { FeatureRepository } from './infrastructure/persistence/repositories/feature.repository';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { OrganizationRepository } from './infrastructure/persistence/repositories/organization.repository';
import { FeatureEventPublisher } from './infrastructure/events/feature.event-publisher';
import { RoleEventPublisher } from './infrastructure/events/role.event-publisher';
import { OrganizationEventPublisher } from './infrastructure/events/organization.event-publisher';
import { FeatureCommandHandler } from './application/services/feature/feature.command.handler';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { FEATURE_REPO } from './domain/repositories/feature.repository';
import { ORGANIZATION_REPO } from './domain/repositories/organization.repository';
import { ROLE_REPO } from './domain/repositories/role.repository';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { PermissionCmdHandler } from './application/services/permission/permission.cmd.handler';
import { PERMISSION_REPO } from './domain/repositories/permission.repository';
import { RoleDomainService } from './domain/services/role.service';
import { ProjectRepository } from './infrastructure/persistence/repositories/project.repository';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { ProjectController } from './presentation/controllers/project.controller';
import { ProjectCmdHandler } from './application/services/project/project.cmd.handler';
import { ProjectQueryHandler } from './application/services/project/project.query.handler';
import { PROJECT_REPO } from './domain/repositories/project.repository';
import { PermissionDomainService } from './domain/services/permission.service';
import { AuthCmdHandler } from './application/services/auth/auth.command.handler';
import { AuthDomainService } from './domain/services/auth.service';
import {
  SESSION_REPO,
  TOKEN_BLACKLIST_REPO,
} from './domain/repositories/auth.repository';
import {
  SessionCacheRepository,
  TokenBlacklistCacheRepository,
} from './infrastructure/persistence/repositories/auth-cache.repository';
import { UserService } from './domain/services/user.service';
import { UserCmdHandler } from './application/services/user/user.command.handler';
import { USER_REPO } from './domain/repositories/user.repository';
import { UserQueryHandler } from './application/services/user/user.query.handler';
import { PermissionController } from './presentation/controllers/permission.controller';
import { PermissionQueryHandler } from './application/services/permission/permission.query.handler';
import { OrgSerevice } from './domain/services/organization.service';

const featureProviders = [
  FeatureCommandHandler,
  FeatureRepository,
  FeatureQueryHandler,
  FeatureEventPublisher,
  {
    provide: FEATURE_REPO,
    useClass: FeatureRepository,
  },
];
const roleProviders = [
  RoleCommandHandler,
  RoleQueryHandler,
  RoleRepository,
  RoleEventPublisher,
  RoleDomainService,
  {
    provide: ROLE_REPO,
    useClass: RoleRepository,
  },
];
const organizationProviders = [
  OrganizationCommandHandler,
  OrganizationQueryHandler,
  OrganizationRepository,
  OrganizationEventPublisher,
  OrgSerevice,
  {
    provide: ORGANIZATION_REPO,
    useClass: OrganizationRepository,
  },
];
const permissionProviders = [
  PermissionRepository,
  PermissionCmdHandler,
  PermissionDomainService,
  PermissionQueryHandler,
  {
    provide: PERMISSION_REPO,
    useClass: PermissionRepository,
  },
];
const projectProviders = [
  ProjectCmdHandler,
  ProjectQueryHandler,
  ProjectRepository,
  {
    provide: PROJECT_REPO,
    useClass: ProjectRepository,
  },
];
const userProviders = [
  UserRepository,
  UserService,
  UserCmdHandler,
  UserQueryHandler,
  {
    provide: USER_REPO,
    useClass: UserRepository,
  },
];

const authProviders = [
  AuthCmdHandler,
  AuthDomainService,
  SessionCacheRepository,
  TokenBlacklistCacheRepository,
  {
    provide: SESSION_REPO,
    useClass: SessionCacheRepository,
  },
  {
    provide: TOKEN_BLACKLIST_REPO,
    useClass: TokenBlacklistCacheRepository,
  },
];

const featureExports = [FeatureRepository, FeatureEventPublisher];
const roleExports = [RoleRepository, RoleEventPublisher];
const organizationExports = [
  OrganizationRepository,
  OrganizationEventPublisher,
  OrgSerevice,
];
const permissionExports = [
  PermissionRepository,
  PermissionCmdHandler,
  PermissionDomainService,
  PermissionQueryHandler,
];
const projectExports = [
  ProjectRepository,
  ProjectCmdHandler,
  ProjectQueryHandler,
];
const userExports = [UserRepository, UserService, UserCmdHandler, UserQueryHandler];

const authExports = [AuthCmdHandler, AuthDomainService];

@Module({
  imports: [],
  controllers: [
    FeatureController,
    RoleController,
    OrganizationController,
    ProjectController,
    UserController,
    PermissionController,
  ],
  providers: [
    ...featureProviders,
    ...roleProviders,
    ...organizationProviders,
    ...permissionProviders,
    ...projectProviders,
    ...userProviders,
    ...authProviders,
  ],
  exports: [
    ...featureExports,
    ...roleExports,
    ...organizationExports,
    ...permissionExports,
    ...projectExports,
    ...userExports,
    ...authExports,
  ],
})
export class IamModule { }
