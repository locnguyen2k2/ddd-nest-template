import { ApiProperty } from '@nestjs/swagger';
import { RoleBaseResDto } from './role-response.dto';

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