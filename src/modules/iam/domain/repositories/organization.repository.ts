import { Organization } from "../entities/organization.entity";

export const ORGANIZATION_REPO = 'ORGANIZATION_REPO';

export interface IOrganizationRepository {
    create(organization: Organization): Promise<Organization>;
    findById(id: string): Promise<Organization | null>;
    findBySlug(slug: string): Promise<Organization | null>;
    findAll(): Promise<Organization[]>;
    update(id: string, organization: Organization): Promise<Organization>;
    delete(id: string): Promise<void>;
}