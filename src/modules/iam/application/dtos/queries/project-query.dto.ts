import { BaseCursorPageOptionDto } from '@/common/pagination';
import { BasePageOptionDto } from '@/common/pagination/dtos/page-options.dto';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetProjectByIdQuery {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: any) {
        this.id = data.id;
    }
}

export class GetProjectBySlugQuery {
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

export class PaginateProjectsQuery extends BasePageOptionDto { }

export class CursorProjectsQuery extends BaseCursorPageOptionDto { }