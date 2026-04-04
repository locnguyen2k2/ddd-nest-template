import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import {
  GetOrganizationByIdQuery,
  GetOrganizationBySlugQuery,
  ListOrganizationsQuery,
} from '../../dtos/queries/organization-query.dto';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';

@Injectable()
export class OrganizationQueryHandler {
  constructor(
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepository: IOrganizationRepository,
  ) { }

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

  async handleListOrganizationsByJoiner(joinerId: string): Promise<Organization[]> {
    let organizations: Organization[] = [];
    try {
      organizations = await this.organizationRepository.handleListOrganizationsByJoiner(joinerId);
    } catch (error) {
      console.error('Error listing organizations by joiner:', error);
    }
    return organizations;
  }

  async handleListOrganizations(query: ListOrganizationsQuery): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, take: limit = 10, keyword: search } = query;
    const skip = (page - 1) * limit;

    const organizations = await this.organizationRepository.findAll();

    let filteredOrganizations = organizations;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrganizations = organizations.filter(
        (org) =>
          org.name().toLowerCase().includes(searchLower) ||
          org.slug().value.toLowerCase().includes(searchLower) ||
          (org.description()?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    const paginatedOrganizations = filteredOrganizations.slice(
      skip,
      skip + limit,
    );
    const total = filteredOrganizations.length;
    const totalPages = Math.ceil(total / limit);

    return {
      organizations: paginatedOrganizations,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
