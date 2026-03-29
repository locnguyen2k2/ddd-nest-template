import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateRoleArgs {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsNotEmpty()
  organization_id: string;

  constructor(data: CreateRoleArgs) {
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.permissions = data.permissions;
    this.organization_id = data.organization_id;
  }
}

export class UpdateRoleArgs {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsNotEmpty()
  organization_id: string;

  constructor(data: UpdateRoleArgs) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.permissions = data.permissions;
    this.organization_id = data.organization_id;
  }
}

export class DeleteRoleArgs {
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(data: DeleteRoleArgs) {
    this.id = data.id;
  }
}

export class AssignPermissionToRoleArgs {
  @IsString()
  @IsNotEmpty()
  role_id: string;

  @IsString()
  @IsNotEmpty()
  permission_id: string;

  @IsString()
  @IsNotEmpty()
  feature_id: string;

  constructor(data: AssignPermissionToRoleArgs) {
    this.role_id = data.role_id;
    this.permission_id = data.permission_id;
    this.feature_id = data.feature_id;
  }
}
