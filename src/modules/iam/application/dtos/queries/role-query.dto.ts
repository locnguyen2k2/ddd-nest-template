import { BaseCursorPageOptionDto } from '@/common/pagination';
import { BasePageOptionDto } from '@/common/pagination/dtos/page-options.dto';

export interface GetRoleByIdQuery {
  id: string;
  organization_id?: string;
}

export interface GetRoleBySlugQuery {
  slug: string;
  organization_id: string;
}

export interface ListRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginateRolesQuery extends BasePageOptionDto {
}

export interface CursorRolesQuery extends BaseCursorPageOptionDto {
}
