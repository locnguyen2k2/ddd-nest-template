import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageOptionDto, BaseCursorPageOptionDto } from '@/common/pagination';

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
  @IsOptional()
  organization_id?: string;
}

export class PaginateRolesQuery extends BasePageOptionDto {
  @IsString()
  @IsOptional()
  organization_id?: string;
}

export class CursorRolesQuery extends BaseCursorPageOptionDto {
  @IsString()
  @IsOptional()
  organization_id?: string;
}
