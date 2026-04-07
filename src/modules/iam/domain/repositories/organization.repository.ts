import { Organization } from '../entities/organization.entity';
import { IPaginate, ICursor } from '@/shared/domain/repositories/base.repository';

export const ORGANIZATION_REPO = 'ORGANIZATION_REPO';

export interface IOrganizationRepository extends IPaginate<Organization>, ICursor<Organization> {
  // Organization operations
  create(organization: Organization): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByIds(ids: string[]): Promise<Organization[]>;
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
  userJoinedAnyOrganization(userId: string): Promise<boolean>;
  organizationHasRole(organizationId: string, roleId: string): Promise<boolean>;
  handleListOrganizationsByJoiner(joinerId: string): Promise<Organization[]>
  assignRoleToUser(organizationId: string, userId: string, roleId: string): Promise<void>
  unassignRoleFromUser(organizationId: string, userId: string, roleId: string): Promise<void>
  findUserOrgRoles(organizationId: string, userId: string): Promise<string[]>
  findOrgRoles(userId: string): Promise<Map<string, string[]>>
  findUserOrganizations(userId: string): Promise<Organization[]>
}
