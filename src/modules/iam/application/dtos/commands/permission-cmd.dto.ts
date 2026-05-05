import { PermissionAction } from '@/common/enum';

export interface CreatePermissionArgs {
  name: string;
  action: PermissionAction;
  description?: string;
}

export interface UpdatePermissionArgs {
  id: string;
  name: string;
  action: PermissionAction;
  description?: string;
}

export interface DeletePermissionArgs {
  id: string;
}
