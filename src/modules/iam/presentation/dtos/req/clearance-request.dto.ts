import {
  BasePageOptionDto,
  BaseCursorPageOptionDto,
} from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateClearanceDto {
  @ApiProperty({ example: 'Top Secret' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  level!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateClearanceDto {
  @ApiProperty({ example: 'Top Secret', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PaginateClearancesQuery extends BasePageOptionDto {}

export class CursorClearancesQuery extends BaseCursorPageOptionDto {}
