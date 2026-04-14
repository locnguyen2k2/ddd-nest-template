export interface GetDepartmentByIdQuery {
  id: string;
}

export interface GetDepartmentsByOrgIdQuery {
  organization_id: string;
}

export interface GetDepartmentBySlugQuery {
  slug: string;
  organization_id: string;
}
