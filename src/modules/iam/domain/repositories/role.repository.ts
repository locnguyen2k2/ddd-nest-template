import { Prisma } from '@prisma/client';
import { RoleEntity } from '../entities/role.entity';
import { IPaginate, ICursor } from '@/shared/domain/repositories/base.repository';

export const ROLE_REPO = 'ROLE_REPO';

export interface IRoleRepository extends IPaginate<Prisma.RoleCreateInput>, ICursor<Prisma.RoleCreateInput> {
    create(role: RoleEntity): Promise<RoleEntity>;
    findById(id: string): Promise<RoleEntity | null>;
    findBySlug(slug: string): Promise<RoleEntity | null>;
    findAll(): Promise<RoleEntity[]>;
    update(id: string, role: RoleEntity): Promise<RoleEntity>;
    delete(id: string): Promise<void>;
}
