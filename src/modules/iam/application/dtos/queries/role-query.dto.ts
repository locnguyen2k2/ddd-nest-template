import { IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";

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

    constructor(data: any) {
        this.slug = data.slug;
    }
}

export class ListRolesQuery {
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


