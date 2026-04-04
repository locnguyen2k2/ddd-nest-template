import { BasePageOptionDto } from '@/common/pagination';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetOrganizationByIdQuery {
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(data: any) {
    this.id = data.id;
  }
}

export class GetOrganizationBySlugQuery {
  @IsString()
  @IsNotEmpty()
  slug: string;

  constructor(data: any) {
    this.slug = data.slug;
  }
}

export class ListOrganizationsQuery extends BasePageOptionDto {
}
