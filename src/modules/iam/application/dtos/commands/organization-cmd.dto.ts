export interface CreateOrganizationArgs {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationArgs {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
}

export interface DeleteOrganizationArgs {
  id: string;
}

export interface UpdateStaffAttributesArgs {
  organizationId: string;
  userId: string;
  attributes?: Record<string, any>;
}
