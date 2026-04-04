import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

// Create Feature Command
export class CreateFeatureArgs {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  project_id: string;

  constructor(data: CreateFeatureArgs) {
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.project_id = data.project_id;
  }
}

// Update Feature Command
export class UpdateFeatureArgs {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  organization_id: string;

  constructor(data: UpdateFeatureArgs) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.organization_id = data.organization_id;
  }
}

// Delete Feature Command
export class DeleteFeatureArgs {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  organization_id: string;

  constructor(data: DeleteFeatureArgs) {
    this.id = data.id;
    this.organization_id = data.organization_id;
  }
}
