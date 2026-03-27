import { Prisma } from '@prisma/client';
import { RoleEntity } from '../entities/role.entity';
import { IPaginate, ICursor } from '@/shared/domain/repositories/base.repository';

export const ROLE_REPO = 'ROLE_REPO';

export interface IRoleRepository extends IPaginate<Prisma.RoleCreateInput>, ICursor<Prisma.RoleCreateInput> {
    create(role: RoleEntity): Promise<RoleEntity>;
    findById(id: string): Promise<RoleEntity | null>;
    findBySlug(slug: string, organization_id: string): Promise<RoleEntity | null>;
    findAll(): Promise<RoleEntity[]>;
    update(id: string, role: RoleEntity): Promise<RoleEntity>;
    delete(id: string): Promise<void>;

    // Role Feature Permission
    createRFP(role_id: string, feature_id: string, permission_id: string): Promise<void>;
    deleteRFP(role_id: string, feature_id: string, permission_id: string): Promise<void>;

    // Role Chain
    userHasRole(user_id: string, role_id: string, organization_id: string): Promise<boolean>
    hasPermission(role_chain_ids: string[], feature_id: string, permission_id: string): Promise<boolean>;

    getRoleChain(role_id: string): Promise<string[]>;
}
