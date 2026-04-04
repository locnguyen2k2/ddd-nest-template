import { AccessControlStatus } from '@/common/enum';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeaturePermissionResponseDto } from './role-response.dto';



export interface RolePermissionResponseDto extends Omit<FeaturePermissionResponseDto, 'feature_id'> {
  role_id: string;
}


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

  @ApiProperty({ required: false })
  role_permission?: RolePermissionResponseDto[];
}

export class ListFeaturesResponseDto {
  @ApiProperty({ type: [FeatureResponseDto] })
  features!: FeatureResponseDto[];

  @ApiProperty()
  pagination!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginateFeaturesResponseDto {
  @ApiProperty({ type: [FeatureResponseDto] })
  features!: FeatureResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorFeaturesResponseDto {
  @ApiProperty({ type: [FeatureResponseDto] })
  features!: FeatureResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
