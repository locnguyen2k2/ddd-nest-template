import { IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";

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

export class ListOrganizationsQuery {
    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    constructor(data: any = {}) {
        this.page = data.page;
        this.limit = data.limit;
        this.search = data.search;
    }
}
