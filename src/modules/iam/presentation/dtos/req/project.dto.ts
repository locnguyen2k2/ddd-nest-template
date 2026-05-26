import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseCursorPageOptionDto,
  BasePageOptionDto,
} from '@/common/pagination';

export class PaginateProjectsQuery extends BasePageOptionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organization_id?: string;
}

export class CreateProjectDto {
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
}

export class UpdateProjectDto {
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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  updated_by?: string;
}

export class CursorProjectsQuery extends BaseCursorPageOptionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organization_id?: string;
}
