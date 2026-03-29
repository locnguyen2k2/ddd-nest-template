import { Organization } from '../entities/organization.entity';

export const ORGANIZATION_REPO = 'ORGANIZATION_REPO';

export interface IOrganizationRepository {
  // Organization operations
  create(organization: Organization): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  update(id: string, organization: Organization): Promise<Organization>;
  delete(id: string): Promise<void>;

  // User operations
  assignUser(
    organizationId: string,
    userId: string,
    roleId?: string,
    createdBy?: string,
  ): Promise<void>;
  unassignUser(organizationId: string, userId: string): Promise<void>;

  // Validation operations
  organizationHasUser(organizationId: string, userId: string): Promise<boolean>;
  organizationHasRole(organizationId: string, roleId: string): Promise<boolean>;
}
