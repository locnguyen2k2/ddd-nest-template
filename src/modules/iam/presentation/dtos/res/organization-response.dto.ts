import { ApiProperty } from '@nestjs/swagger';
import { RoleBaseResDto } from './role-response.dto';
import { CursorPaginationDto } from '@/common/pagination';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/pagination';

export class OrgBaseResDto {
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
}

export class OrgRolesResDto extends OrgBaseResDto {
  @ApiProperty()
  roles!: RoleBaseResDto[];
}

export class ListOrganizationsResponseDto {
  @ApiProperty({ type: [OrgBaseResDto] })
  organizations!: OrgBaseResDto[];

  @ApiProperty()
  pagination!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginateOrganizationsResponseDto {
  @ApiProperty({ type: [OrgBaseResDto] })
  data!: OrgBaseResDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorOrganizationsResponseDto {
  @ApiProperty({ type: [OrgBaseResDto] })
  data!: OrgBaseResDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
