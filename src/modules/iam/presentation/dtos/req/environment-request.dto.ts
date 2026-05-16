import {
  BasePageOptionDto,
  BaseCursorPageOptionDto,
} from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({ example: 'Production' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'production' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateEnvironmentDto {
  @ApiProperty({ example: 'Production', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'production', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PaginateEnvironmentsQuery extends BasePageOptionDto {}

export class CursorEnvironmentsQuery extends BaseCursorPageOptionDto {}
