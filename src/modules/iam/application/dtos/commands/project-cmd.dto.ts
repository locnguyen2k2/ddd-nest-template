export interface CreateProjectArgs {
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
}

export interface UpdateProjectArgs extends Partial<CreateProjectArgs> {}

export interface DeleteProjectArgs {
  id: string;
  organization_id: string;
}
