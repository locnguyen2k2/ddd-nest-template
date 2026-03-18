import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateOrganizationArgs {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsNotEmpty()
    slug: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    roles?: string[];

    constructor(data: CreateOrganizationArgs) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.roles = data.roles;
    }
}

export class UpdateOrganizationArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    name?: string;
    @IsString()
    @IsOptional()
    slug?: string;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    roles?: string[];

    constructor(data: UpdateOrganizationArgs) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.roles = data.roles;
    }
}

export class DeleteOrganizationArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: DeleteOrganizationArgs) {
        this.id = data.id;
    }
}
