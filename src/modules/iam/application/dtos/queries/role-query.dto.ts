import { BaseCursorPageOptionDto } from '@/common/pagination';
import { BasePageOptionDto } from '@/common/pagination/dtos/page-options.dto';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetRoleByIdQuery {
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(data: any) {
    this.id = data.id;
  }
}

export class GetRoleBySlugQuery {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  organization_id: string;

  constructor(data: any) {
    this.slug = data.slug;
    this.organization_id = data.organization_id;
  }
}

export class PaginateRolesQuery extends BasePageOptionDto {}

export class CursorRolesQuery extends BaseCursorPageOptionDto {}
