import { Module } from '@nestjs/common';
import { FeatureController } from './presentation/controllers/feature.controller';
import { OrganizationController } from './presentation/controllers/organization.controller';
import { UserController } from './presentation/controllers/user.controller';
import { FeatureQueryHandler } from '@/modules/iam/application/services/feature/query.handler';
import { OrganizationCommandHandler } from '@/modules/iam/application/services/organization/command.handler';
import { OrganizationQueryHandler } from '@/modules/iam/application/services/organization/query.handler';
import { FeatureRepository } from './infrastructure/persistence/repositories/feature.repository';
import { OrganizationRepository } from './infrastructure/persistence/repositories/organization.repository';
import { FeatureEventPublisher } from './infrastructure/events/feature.event-publisher';
import { OrganizationEventPublisher } from './infrastructure/events/organization.event-publisher';
import { FeatureCommandHandler } from './application/services/feature/command.handler';
import { FEATURE_REPO } from './domain/repositories/feature.repository';
import { ORGANIZATION_REPO } from './domain/repositories/organization.repository';
import { ProjectRepository } from './infrastructure/persistence/repositories/project.repository';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { ProjectController } from './presentation/controllers/project.controller';
import { ProjectCmdHandler } from './application/services/project/cmd.handler';
import { ProjectQueryHandler } from './application/services/project/query.handler';
import { PROJECT_REPO } from './domain/repositories/project.repository';
import { AuthCmdHandler } from './application/services/auth/command.handler';
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
import { UserCmdHandler } from './application/services/user/command.handler';
import { USER_REPO } from './domain/repositories/user.repository';
import { UserQueryHandler } from './application/services/user/query.handler';
import { OrgSerevice } from './domain/services/organization.service';
import { POLICY_REPO } from './domain/repositories/policy.repository';
import { PrismaPolicyRepository } from './infrastructure/persistence/repositories/policy.repository';
import { AbacGuard } from './presentation/guards/abac.guard';
import { TenantContextGuard } from './presentation/guards/tenant-context.guard';
import { AUTH_WRAPPER_CMD_HANDLER, AuthWrapperCmdHandler } from './application/services/auth/wrapper.command.handler';
import { PolicyQueryService } from './application/services/policy/policy-query.service';

import { PolicyController } from './presentation/controllers/policy.controller';
import { PolicyCommandHandler } from './application/services/policy/command.handler';
import { PolicyQueryHandler } from './application/services/policy/query.handler';
import { STAFF_REPO } from './domain/repositories/staff.repository';
import { StaffRepository } from './infrastructure/persistence/repositories/staff.repository';
import { DepartmentCommandHandler } from './application/services/department/command.handler';
import { DepartmentQueryHandler } from './application/services/department/query.handler';
import { DepartmentController } from './presentation/controllers/department.controller';
import { DEPARTMENT_REPO } from './domain/repositories/department.repository';
import { DepartmentRepository } from './infrastructure/persistence/repositories/department.repository';
import { MemberCommandHandler } from './application/services/member/command.handler';
import { MemberQueryHandler } from './application/services/member/query.handler';
import { MemberController } from './presentation/controllers/member.controller';
import { MEMBER_REPO } from './domain/repositories/member.repository';
import { MemberRepository } from './infrastructure/persistence/repositories/member.repository';
import { AttributeCommandHandler } from './application/services/attributes/command.handler';
import { AttributeQueryHandler } from './application/services/attributes/query.handler';
import { ATTRIBUTE_REPO } from './domain/repositories/attribute.repository';
import { AttributeRepository } from './infrastructure/persistence/repositories/attribute.repository';

const abacProviders = [
  PrismaPolicyRepository,
  PolicyQueryService,
  AbacGuard,
  PolicyCommandHandler,
  PolicyQueryHandler,
  {
    provide: POLICY_REPO,
    useClass: PrismaPolicyRepository,
  },
];
const featureProviders = [
  FeatureCommandHandler,
  FeatureRepository,
  FeatureQueryHandler,
  FeatureEventPublisher,
  { provide: FEATURE_REPO, useClass: FeatureRepository },
];
const organizationProviders = [
  OrganizationCommandHandler,
  OrganizationQueryHandler,
  OrganizationRepository,
  OrganizationEventPublisher,
  OrgSerevice,
  TenantContextGuard,
  {
    provide: ORGANIZATION_REPO,
    useClass: OrganizationRepository,
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
const staffProviders = [
  StaffRepository,
  { provide: STAFF_REPO, useClass: StaffRepository },
];
const departmentProviders = [
  DepartmentCommandHandler,
  DepartmentQueryHandler,
  DepartmentRepository,
  { provide: DEPARTMENT_REPO, useClass: DepartmentRepository },
];
const memberProviders = [
  MemberCommandHandler,
  MemberQueryHandler,
  MemberRepository,
  { provide: MEMBER_REPO, useClass: MemberRepository },
];
const authProviders = [
  AuthCmdHandler,
  AuthDomainService,
  SessionCacheRepository,
  TokenBlacklistCacheRepository,
  AuthWrapperCmdHandler,
  {
    provide: SESSION_REPO,
    useClass: SessionCacheRepository,
  },
  {
    provide: TOKEN_BLACKLIST_REPO,
    useClass: TokenBlacklistCacheRepository,
  },
  {
    provide: AUTH_WRAPPER_CMD_HANDLER,
    useClass: AuthWrapperCmdHandler,
  },
];
const attributeProviders = [
  AttributeCommandHandler,
  AttributeQueryHandler,
  AttributeRepository,
  { provide: ATTRIBUTE_REPO, useClass: AttributeRepository },
];

const featureExports = [FeatureRepository];
const organizationExports = [OrganizationRepository, OrgSerevice, TenantContextGuard];
const projectExports = [ProjectRepository, ProjectCmdHandler, ProjectQueryHandler];
const userExports = [UserRepository, UserService, UserCmdHandler, UserQueryHandler];
const authExports = [AuthCmdHandler, AuthDomainService, AuthWrapperCmdHandler];
const abacExports = [PrismaPolicyRepository, AbacGuard];
const staffExports = [StaffRepository];
const departmentExports = [DepartmentRepository, DepartmentCommandHandler, DepartmentQueryHandler];
const memberExports = [MemberRepository, MemberCommandHandler, MemberQueryHandler];
const attributeExports = [AttributeRepository, AttributeCommandHandler, AttributeQueryHandler];

@Module({
  imports: [],
  controllers: [FeatureController, OrganizationController, ProjectController, UserController, PolicyController, DepartmentController, MemberController],
  providers: [
    ...abacProviders,
    ...featureProviders,
    ...organizationProviders,
    ...projectProviders,
    ...userProviders,
    ...authProviders,
    ...staffProviders,
    ...departmentProviders,
    ...memberProviders,
    ...attributeProviders,
  ],
  exports: [
    ...featureExports,
    ...organizationExports,
    ...projectExports,
    ...userExports,
    ...authExports,
    ...abacExports,
    ...staffExports,
    ...departmentExports,
    ...memberExports,
    ...attributeExports,
  ],
})
export class IamModule { }
