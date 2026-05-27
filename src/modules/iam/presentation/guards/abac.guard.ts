import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_ABAC_KEY,
  AbacMetadata,
} from '../../../../common/decorators/check-abac.decorator';
import { PolicyQueryService } from '../../application/services/policy/policy-query.service';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { HeaderKeys, StorageKeys } from '@/common/constant';
import { MemberMapper } from '../../infrastructure/persistence/mappers/member.mapper';
import { UserMapper } from '../../infrastructure/persistence/mappers/user.mapper';
import { ProjectMapper } from '../../infrastructure/persistence/mappers/project.mapper';
import { OrganizationMapper } from '../../infrastructure/persistence/mappers/organization.mapper';
import { FeatureMapper } from '../../infrastructure/persistence/mappers/feature.mapper';
import { BusinessException } from '@/common/http/business-exception';
import { UserQueryHandler } from '../../application/services/user/query.handler';
import { ProjectQueryHandler } from '../../application/services/project/query.handler';
import { OrganizationQueryHandler } from '../../application/services/organization/query.handler';
import { FeatureQueryHandler } from '../../application/services/feature/query.handler';
import { MemberQueryHandler } from '../../application/services/member/query.handler';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly pdp: PolicyQueryService,
    private readonly cls: ClsService<MyClsStore>,
    private readonly userQueryHandler: UserQueryHandler,
    private readonly projectQueryHandler: ProjectQueryHandler,
    private readonly orgQueryHandler: OrganizationQueryHandler,
    private readonly featureQueryHandler: FeatureQueryHandler,
    private readonly memberQueryHandler: MemberQueryHandler,
  ) { }

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
      this.userQueryHandler.findByIdWithOrganizations(userId),
      this.fetchResource(metadata.resource, request),
    ]);

    if (!user) return false;
    if (!resource) return false;
    const staffId = user.organizations.find(
      (org) => org.organization_id === organizationId,
    )?.id;
    const joinedProjects = await this.memberQueryHandler.handleGetByStaffId({ staff_id: staffId! });
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
          data = await this.orgQueryHandler.handleGetById({ id });
          data = OrganizationMapper.toPrisma(data);
        } else {
          data = await this.projectQueryHandler.handlerGetByID(id);
          data = ProjectMapper.toPrisma(data);
        }
        data['type'] = 'project';
        break;
      case 'organization':
        if (!id) {
          id = request.headers[HeaderKeys.ORG_ID];
        }
        data = await this.orgQueryHandler.handleGetById({ id });
        data = OrganizationMapper.toPrisma(data);
        data['type'] = 'organization';
        break;
      case 'feature':
        if (!id) {
          id = request.headers[HeaderKeys.PROJECT_ID];
          data = await this.projectQueryHandler.handlerGetByID(id);
          data = ProjectMapper.toPrisma(data);
        } else {
          data = await this.featureQueryHandler.handleGetById({ id });
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
