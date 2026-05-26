export interface CreateRoleArgs {
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  attributes?: Record<string, any>;
}

export interface UpdateRoleArgs {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  organization_id: string;
  attributes?: Record<string, any>;
}

export interface DeleteRoleArgs {
  id: string;
  organization_id: string;
}
