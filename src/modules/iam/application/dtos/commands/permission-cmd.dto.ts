import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePermissionArgs {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    constructor(data: CreatePermissionArgs) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data?.description;
    }
}

export class UpdatePermissionArgs {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    constructor(data: UpdatePermissionArgs) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data?.description;
    }
}

export class DeletePermissionArgs {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: DeletePermissionArgs) {
        this.id = data.id;
    }
}

