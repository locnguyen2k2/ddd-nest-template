import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ABAC_KEY, AbacMetadata } from '../../../../common/decorators/check-abac.decorator';
import { IUserRepository, USER_REPO } from '../../domain/repositories/user.repository';
import { PROJECT_REPO, IProjectRepository } from '../../domain/repositories/project.repository';
import { ORGANIZATION_REPO, IOrganizationRepository } from '../../domain/repositories/organization.repository';
import { FEATURE_REPO, IFeatureRepository } from '../../domain/repositories/feature.repository';
import { PolicyQueryService } from '../../application/services/policy/policy-query.service';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { StorageKeys } from '@/common/constant';

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
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<AbacMetadata>(CHECK_ABAC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.id;
    if (!userId) return false;

    const user = await this.userRepo.findByIdWithOrganizations(userId);
    if (!user) return false;

    const resource = await this.fetchResource(metadata.resource, request);
    const organizationId = this.cls.get(StorageKeys.ORG_ID);

    const isAllowed = await this.pdp.decide({
      subject: user,
      action: metadata.action,
      resource: resource || metadata.resource,
      organization_id: organizationId,
      environment: {
        time: new Date().toISOString(),
        ip: request.ip,
      },
    });

    if (!isAllowed) {
      throw new ForbiddenException('Access denied by ABAC policy');
    }

    return true;
  }

  private async fetchResource(resourceName: string, request: any): Promise<any> {
    const id = request?.params?.id || request?.body?.id || request?.query?.id;
    if (!id) return null;

    switch (resourceName.toLowerCase()) {
      case 'project':
        return await this.projectRepo.findById(id);
      case 'organization':
        return await this.organizationRepo.findById(id);
      case 'feature':
        return await this.featureRepo.findOneById(id);
      default:
        return null;
    }
  }
}
