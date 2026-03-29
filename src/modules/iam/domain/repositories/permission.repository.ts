import { PermissionEntity } from '../entities/permission.entity';

export const PERMISSION_REPO = 'PERMISSION_REPO';

export interface IPermissionRepository {
  create(permission: PermissionEntity): Promise<PermissionEntity | null>;
  findById(id: string): Promise<PermissionEntity | null>;
  findByAction(
    action: string,
    organizationId?: string,
  ): Promise<PermissionEntity | null>;
  findAll(): Promise<PermissionEntity[]>;
  update(
    id: string,
    permission: PermissionEntity,
  ): Promise<PermissionEntity | null>;
  delete(id: string): Promise<void>;
}
