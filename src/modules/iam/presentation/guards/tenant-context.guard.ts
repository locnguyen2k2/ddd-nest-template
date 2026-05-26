import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { OrganizationRepository } from '../../infrastructure/persistence/repositories/organization.repository';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { HeaderKeys, StorageKeys } from '@/common/constant';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { Organization } from '../../domain/entities/organization.entity';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly cls: ClsService<MyClsStore>,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = (request.headers[HeaderKeys.ORG_ID] ||
      request.params.orgId) as string;
    const orgSlug = (request.headers[HeaderKeys.ORG_SLUG] ||
      request.params.orgSlug) as string;

    if (!orgId && !orgSlug) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        'Organization ID or slug is required',
      );
    }

    const user = request.user;
    if (!user || !user.sub) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED, 'User not found');
    }

    let organization: Organization | null = null;
    if (orgId) {
      organization = await this.organizationRepository.findById(orgId);
    } else if (orgSlug) {
      organization = await this.organizationRepository.findBySlug(orgSlug);
    }

    if (!organization) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        'Organization not found',
      );
    }

    const hasAccess = await this.organizationRepository.organizationHasUser(
      organization.id.value,
      user.sub,
    );

    if (!hasAccess) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        'User does not have access to this organization',
      );
    }

    this.cls.set(StorageKeys.ORG_ID, organization.id.value);
    this.cls.set(StorageKeys.ORG_SLUG, organization.slug().value);
    this.cls.set(StorageKeys.ORG, organization);

    return true;
  }
}
