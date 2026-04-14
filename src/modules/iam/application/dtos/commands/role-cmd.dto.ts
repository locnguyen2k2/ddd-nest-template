export interface CreateRoleArgs {
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
  organization_id: string;
  parent_role_id?: string;
}

export interface UpdateRoleArgs {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  permissions?: string[];
  organization_id: string;
  parent_id?: string;
}

export interface DeleteRoleArgs {
  id: string;
}

export interface AssignPermissionToRoleArgs {
  role_id: string;
  permission_id: string;
  feature_id: string;
}