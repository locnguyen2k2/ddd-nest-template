import { BasePageOptionDto } from '@/common/pagination';

export interface GetOrganizationByIdQuery {
  id: string;
}

export interface GetOrganizationBySlugQuery {
  slug: string;
}

export interface ListOrganizationsQuery extends BasePageOptionDto {
}
