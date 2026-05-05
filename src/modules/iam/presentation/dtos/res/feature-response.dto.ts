import { AccessControlStatus } from '@/common/enum';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeatureResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiProperty()
  project_id!: string;

  @ApiProperty()
  status!: AccessControlStatus;

  @ApiProperty({ required: false })
  created_by?: string;

  @ApiProperty({ required: false })
  updated_by?: string;
}

export class PaginateFeaturesResponseDto {
  @ApiProperty({ type: [FeatureResponseDto] })
  data!: FeatureResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorFeaturesResponseDto {
  @ApiProperty({ type: [FeatureResponseDto] })
  data!: FeatureResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
