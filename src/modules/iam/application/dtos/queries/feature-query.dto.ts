import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Get Feature By ID Query
export class GetFeatureByIdQuery {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: GetFeatureByIdQuery) {
        this.id = data.id;
    }
}

// Get Feature By Slug Query
export class GetFeatureBySlugQuery {
    @IsString()
    @IsNotEmpty()
    slug: string;

    constructor(data: GetFeatureBySlugQuery) {
        this.slug = data.slug;
    }
}

// List Features Query
export class ListFeaturesQuery {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    constructor(data: ListFeaturesQuery) {
        this.page = data.page || 1;
        this.limit = data.limit || 10;
        this.search = data.search;
    }
}
