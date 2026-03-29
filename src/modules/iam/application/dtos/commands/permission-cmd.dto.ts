import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction } from '@prisma/client';

export class CreatePermissionArgs {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, enum: PermissionAction })
  @IsString()
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  constructor(data: CreatePermissionArgs) {
    this.name = data.name;
    this.action = data.action;
    this.description = data?.description;
    this.organizationId = data?.organizationId;
  }
}

export class UpdatePermissionArgs {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, enum: PermissionAction })
  @IsString()
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  constructor(data: UpdatePermissionArgs) {
    this.id = data.id;
    this.name = data.name;
    this.action = data.action;
    this.description = data?.description;
  }
}

export class DeletePermissionArgs {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(data: DeletePermissionArgs) {
    this.id = data.id;
  }
}
