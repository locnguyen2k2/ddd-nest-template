import { HeaderKeys, KEYS, StorageKeys } from '@/common/constant';
import {
  CanActivate,
  ExecutionContext,
  Head,
  Header,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { Organization } from '../../domain/entities/organization.entity';
import { OrganizationQueryHandler } from '../../application/services/organization/query.handler';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class HeadersAuthGuard implements CanActivate {
  constructor(
    private readonly cls: ClsService<MyClsStore>,
    private readonly reflector: Reflector,
    private readonly orgQuery: OrganizationQueryHandler,
  ) { }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();

    // Get required headers
    const requiredHeaders = this.reflector.getAllAndOverride<string | string[]>(
      KEYS.HEADERS,
      [context.getHandler(), context.getClass()],
    );
    let requiredHeadersList: string[] = [];
    if (requiredHeaders) {
      requiredHeadersList = Array.isArray(requiredHeaders)
        ? requiredHeaders
        : [requiredHeaders];
    }

    if (requiredHeadersList.length > 0) {
      const mappedKeys: Map<string, string> = new Map();
      for (const header of requiredHeadersList) {
        if (!request.headers[header]) {
          throw new BusinessException(`400|${header} header is required`);
        }
        mappedKeys.set(header, request.headers[header]);
      }

      if (mappedKeys.has(HeaderKeys.ORG_ID)) {
        if (!mappedKeys.get(HeaderKeys.ORG_ID)) {
          throw new BusinessException(
            `400|${HeaderKeys.ORG_ID} header is required`,
          );
        }

        const orgID = mappedKeys.get(HeaderKeys.ORG_ID)!;
        let org: Organization | null = null;
        try {
          org = await this.orgQuery.handleGetById({ id: orgID });
        } catch (e: any) { }
        if (!org) {
          throw new BusinessException(
            ErrorEnum.RECORD_NOT_FOUND,
            'Organization not found',
          );
        }
        const user = request.user;
        if (!user || !user.sub) {
          throw new BusinessException(ErrorEnum.UNAUTHORIZED, 'User not found');
        }
        const hasAccess = await this.orgQuery.organizationHasUser(
          org.id.value,
          user.sub,
        );
        if (!hasAccess) {
          throw new BusinessException(
            ErrorEnum.RECORD_NOT_FOUND,
            'User does not have access to this organization',
          );
        }

        this.cls.set(StorageKeys.ORG_ID, org.id.value);
        this.cls.set(StorageKeys.ORG_SLUG, org.slug().value);
        this.cls.set(StorageKeys.ORG, org);
      }
    } else {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        'Header key is required',
      );
    }

    return true;
  }
}
