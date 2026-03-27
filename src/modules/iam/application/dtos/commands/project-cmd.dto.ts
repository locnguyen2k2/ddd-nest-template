import { PartialType } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateProjectArgs {
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
    @IsNotEmpty()
    organization_id: string;

    constructor(data: CreateProjectArgs) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.organization_id = data.organization_id;
    }
}

export class UpdateProjectArgs extends PartialType(CreateProjectArgs) {
}
