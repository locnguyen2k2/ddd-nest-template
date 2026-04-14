import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import {
  GetOrganizationByIdQuery,
  GetOrganizationBySlugQuery,
  ListOrganizationsQuery,
} from '../../dtos/queries/organization-query.dto';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { async } from 'rxjs';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { CursorOrganizationsQuery, PaginateOrganizationsQuery } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { PaginateOrganizationsResponseDto } from '@/modules/iam/presentation/dtos/res/organization-response.dto';

@Injectable()
export class OrganizationQueryHandler {
  constructor(
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepository: IOrganizationRepository,
  ) { }

  @LogExecutionTime()
  async handlePaginate(query: PaginateOrganizationsQuery) {
    return await this.organizationRepository.paginate(query);
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorOrganizationsQuery) {
    return await this.organizationRepository.cursorPagination(query);
  }

  @LogExecutionTime()
  async handleCursorOrganizationsByJoiner(query: CursorOrganizationsQuery, joinerId: string) {
    try {
      return await this.organizationRepository.cursorPaginationByJoiner(query, joinerId);
    } catch (error) {
      console.error('Error listing organizations by joiner:', error);
    }
    return null;
  }

  async handleGetOrganizationById(
    query: GetOrganizationByIdQuery,
  ): Promise<Organization | null> {
    return await this.organizationRepository.findById(query.id);
  }

  async handleGetOrganizationBySlug(
    query: GetOrganizationBySlugQuery,
  ): Promise<Organization | null> {
    return await this.organizationRepository.findBySlug(query.slug);
  }

  async handleListOrganizationsByJoiner(query: PaginateOrganizationsQuery, joinerId: string) {
    try {
      return await this.organizationRepository.handleListOrganizationsByJoiner(query, joinerId);
    } catch (error) {
      console.error('Error listing organizations by joiner:', error);
    }
    return null;
  }
}
