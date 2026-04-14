// Create Feature Command
export interface CreateFeatureArgs {
  name: string;
  slug: string;
  description?: string;
  project_id: string;
  organization_id: string;
}

// Update Feature Command
export interface UpdateFeatureArgs {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  organization_id: string;
}

// Delete Feature Command
export interface DeleteFeatureArgs {
  id: string;
  organization_id: string;
}

