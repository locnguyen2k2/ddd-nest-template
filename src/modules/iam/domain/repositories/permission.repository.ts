import { ICursor, IPaginate } from '@/shared/domain/repositories/base.repository';
import { PermissionResponseDto } from '../../presentation/dtos/res/permission-response.dto';
import { PermissionEntity } from '../entities/permission.entity';
import { PermissionAction } from '@/common/enum';

export const PERMISSION_REPO = 'PERMISSION_REPO';

export interface IPermissionRepository extends IPaginate<PermissionResponseDto>, ICursor<PermissionResponseDto> {
  create(permission: PermissionEntity): Promise<PermissionEntity | null>;
  findById(id: string): Promise<PermissionEntity | null>;
  findByAction(
    action: PermissionAction,
  ): Promise<PermissionEntity | null>;
  findByActionWithRFPs(
    action: PermissionAction,
  ): Promise<PermissionEntity | null>;
  findAll(): Promise<PermissionEntity[]>;
  update(
    id: string,
    permission: PermissionEntity,
  ): Promise<PermissionEntity | null>;
  delete(id: string): Promise<void>;
}
