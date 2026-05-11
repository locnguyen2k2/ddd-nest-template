import { BaseCursorPageOptionDto } from '@/common/pagination';
import { BasePageOptionDto } from '@/common/pagination/dtos/page-options.dto';

export interface GetFeatureByIdQuery {
  id: string;

  organization_id?: string;
}

export interface GetFeatureBySlugQuery {
  slug: string;

  organization_id: string;

}

export interface ListFeaturesQuery {
  page?: number;

  limit?: number;

  search?: string;
}

export interface PaginateFeaturesQuery extends BasePageOptionDto {
  project_id?: string;
}

export interface CursorFeaturesQuery extends BaseCursorPageOptionDto {
  project_id?: string;
}
