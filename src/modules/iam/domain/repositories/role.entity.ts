import { RoleEntity } from '../entities/role.entity';

export const ROLE_REPO = 'ROLE_REPO';

export interface IRoleRepository {
    create(role: RoleEntity): Promise<RoleEntity>;
    findById(id: string): Promise<RoleEntity | null>;
    findBySlug(slug: string): Promise<RoleEntity | null>;
    findAll(): Promise<RoleEntity[]>;
    update(id: string, role: RoleEntity): Promise<RoleEntity>;
    delete(id: string): Promise<void>;
}
