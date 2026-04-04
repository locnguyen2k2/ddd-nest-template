import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organization_id!: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parent_role_id?: string;
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  organization_id!: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parent_role_id?: string;
}

export class AssignPermissionToRoleArgs {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role_id!: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  permission_id!: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  feature_id!: string;
}

