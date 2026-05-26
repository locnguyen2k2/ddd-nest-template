import {
  BasePageOptionDto,
  BaseCursorPageOptionDto,
} from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'engineering' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'uuid-v7-org-id' })
  @IsString()
  @IsNotEmpty()
  organization_id!: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Engineering V2', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'engineering-v2', required: false })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class PaginateDepartmentsQuery extends BasePageOptionDto {}

export class CursorDepartmentsQuery extends BaseCursorPageOptionDto {}
