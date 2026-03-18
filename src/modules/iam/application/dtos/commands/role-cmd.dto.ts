import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CreateRoleArgs {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    permissions?: string[];

    constructor(data: CreateRoleArgs) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.permissions = data.permissions;
    }
}

export class UpdateRoleArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    permissions?: string[];

    constructor(data: UpdateRoleArgs) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.permissions = data.permissions;
    }
}

export class DeleteRoleArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: DeleteRoleArgs) {
        this.id = data.id;
    }
}

