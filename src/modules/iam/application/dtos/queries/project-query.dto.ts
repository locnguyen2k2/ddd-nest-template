import { BaseCursorPageOptionDto } from '@/common/pagination';
import { BasePageOptionDto } from '@/common/pagination/dtos/page-options.dto';

export interface GetProjectByIdQuery {
  id: string;

  organization_id?: string;
}

export interface GetProjectBySlugQuery {
  slug: string;

  organization_id: string;
}

export interface PaginateProjectsQuery extends BasePageOptionDto {
  organization_id?: string;
}

export interface CursorProjectsQuery extends BaseCursorPageOptionDto {
  organization_id?: string;
}
