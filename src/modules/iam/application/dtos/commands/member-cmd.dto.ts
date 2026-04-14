import { AccessControlStatus } from '@/common/enum';

export interface CreateMemberArgs {
  staff_id: string;
  project_id: string;
  status?: AccessControlStatus;
  attributes?: Record<string, any>;
}

export interface UpdateMemberArgs {
  id: string;
  status?: AccessControlStatus;
  attributes?: Record<string, any>;
}

export interface DeleteMemberArgs {
  id: string;
}
