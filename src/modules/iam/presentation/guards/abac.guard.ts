import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_ABAC_KEY,
  AbacMetadata,
} from '../../../../common/decorators/check-abac.decorator';
import {
  IUserRepository,
  USER_REPO,
} from '../../domain/repositories/user.repository';
import {
  PROJECT_REPO,
  IProjectRepository,
} from '../../domain/repositories/project.repository';
import {
  ORGANIZATION_REPO,
  IOrganizationRepository,
} from '../../domain/repositories/organization.repository';
import {
  FEATURE_REPO,
  IFeatureRepository,
} from '../../domain/repositories/feature.repository';
import { PolicyQueryService } from '../../application/services/policy/policy-query.service';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { HeaderKeys, StorageKeys } from '@/common/constant';
import {
  IMemberRepository,
  MEMBER_REPO,
} from '../../domain/repositories/member.repository';
import { MemberMapper } from '../../infrastructure/persistence/mappers/member.mapper';
import { UserMapper } from '../../infrastructure/persistence/mappers/user.mapper';
import { ProjectMapper } from '../../infrastructure/persistence/mappers/project.mapper';
import { OrganizationMapper } from '../../infrastructure/persistence/mappers/organization.mapper';
import { FeatureMapper } from '../../infrastructure/persistence/mappers/feature.mapper';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly pdp: PolicyQueryService,
    private readonly cls: ClsService<MyClsStore>,
    @Inject(USER_REPO)
    private readonly userRepo: IUserRepository,
    @Inject(PROJECT_REPO)
    private readonly projectRepo: IProjectRepository,
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepo: IOrganizationRepository,
    @Inject(FEATURE_REPO)
    private readonly featureRepo: IFeatureRepository,
    @Inject(MEMBER_REPO) private readonly memberRepo: IMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<AbacMetadata>(
      CHECK_ABAC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.id;
    if (!userId) return false;
    const organizationId = this.cls.get(StorageKeys.ORG_ID);

    const [user, resource] = await Promise.all([
      this.userRepo.findByIdWithOrganizations(userId),
      this.fetchResource(metadata.resource, request),
    ]);

    if (!user) return false;
    if (!resource) return false;
    const staffId = user.organizations.find(
      (org) => org.organization_id === organizationId,
    )?.id;
    const joinedProjects = await this.memberRepo.findByStaffId(staffId || '');
    const members = joinedProjects.map(MemberMapper.toPrisma);
    const userMembers = UserMapper.toDomainWithMembers({
      ...UserMapper.toPrismaWithOrganizations(user),
      members,
    });

    const isAllowed = await this.pdp.decide({
      subject: userMembers,
      action: metadata.action,
      resource: resource || metadata.resource,
      organization_id: organizationId,
      environment: {
        time: new Date().toISOString(),
        ip: request.ip,
      },
    });

    if (!isAllowed) {
      throw new BusinessException('400|Access denied by ABAC policy');
    }

    return true;
  }

  private async fetchResource(
    resourceName: string,
    request: any,
  ): Promise<any> {
    let id = request?.params?.id || request?.body?.id || request?.query?.id;
    let data: any = null;

    switch (resourceName.toLowerCase()) {
      case 'project':
        if (!id) {
          id = request.headers[HeaderKeys.ORG_ID];
          data = await this.organizationRepo.findById(id);
          data = OrganizationMapper.toPrisma(data);
        } else {
          data = await this.projectRepo.findById(id);
          data = ProjectMapper.toPrisma(data);
        }
        data['type'] = 'project';
        break;
      case 'organization':
        if (!id) {
          id = request.headers[HeaderKeys.ORG_ID];
        }
        data = await this.organizationRepo.findById(id);
        data = OrganizationMapper.toPrisma(data);
        data['type'] = 'organization';
        break;
      case 'feature':
        if (!id) {
          id = request.headers[HeaderKeys.PROJECT_ID];
          data = await this.projectRepo.findById(id);
          data = ProjectMapper.toPrisma(data);
        } else {
          data = await this.featureRepo.findOneById(id);
          data = FeatureMapper.toPrisma(data);
        }
        data['type'] = 'feature';
        break;
      default:
        return null;
    }

    if (!id) {
      return null;
    }

    return data;
  }
}
