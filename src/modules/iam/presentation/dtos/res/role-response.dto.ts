import { AccessControlStatus } from '@/common/enum';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeaturePermissionResponseDto {
  feature_id!: string;
  permission_id!: string;
  created_at!: Date | undefined;
  updated_at!: Date | undefined;
  created_by!: string | undefined;
  updated_by!: string | undefined;
  status!: AccessControlStatus;
}

export class RoleResponseDto {
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

  @ApiProperty({ required: false })
  parent_role_id?: string;

  @ApiProperty({ required: false })
  created_by?: string;

  @ApiProperty({ required: false })
  updated_by?: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  feature_permission!: FeaturePermissionResponseDto[]
}

export class PaginateRolesResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  roles!: RoleResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorRolesResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  roles!: RoleResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  paginated!: CursorPaginationDto;
}
