import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePageOptionDto, BaseCursorPageOptionDto } from '@/common/pagination';

export class CreateFeatureDto {
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
  project_id!: string;
}

export class UpdateFeatureDto {
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

export class PaginateFeaturesQuery extends BasePageOptionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  project_id?: string;
}

export class CursorFeaturesQuery extends BaseCursorPageOptionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  project_id?: string;
}
