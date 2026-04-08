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

export class RoleBaseResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiProperty({ required: false })
  parent_role_id?: string | null;

  @ApiProperty({ required: false })
  created_by?: string | null;

  @ApiProperty({ required: false })
  updated_by?: string | null;

  @ApiProperty()
  status!: string;
}

export class RoleResponseDto extends RoleBaseResDto {
  @ApiProperty()
  feature_permission!: FeaturePermissionResponseDto[]
}

export class PaginateRolesResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  data!: RoleResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorRolesResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  data!: RoleResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  paginated!: CursorPaginationDto;
}
