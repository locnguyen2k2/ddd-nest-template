export interface CreateDepartmentArgs {
  name: string;
  slug: string;
  organization_id: string;
  attributes?: Record<string, any>;
}

export interface UpdateDepartmentArgs {
  id: string;
  name?: string;
  slug?: string;
}

export interface DeleteDepartmentArgs {
  id: string;
}
