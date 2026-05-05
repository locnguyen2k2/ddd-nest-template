// import { Role } from '../entities/role.entity';
// import {
//   IPaginate,
//   ICursor,
// } from '@/shared/domain/repositories/base.repository';

// export const ROLE_REPO = Symbol('ROLE_REPO');
// export interface IRoleRepository
//   extends IPaginate<Role>, ICursor<Role> {
//   findOneById(id: string, organization_id?: string): Promise<Role | null>;
//   findOneBySlug(slug: string, organization_id: string): Promise<Role | null>;
//   create(data: Role): Promise<Role>;
//   update(id: string, data: Role): Promise<Role>;
//   delete(id: string): Promise<void>;
//   findByOrganizationId(orgId: string): Promise<Role[]>
// }
