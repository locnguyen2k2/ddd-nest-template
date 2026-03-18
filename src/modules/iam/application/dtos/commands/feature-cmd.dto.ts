import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

// Create Feature Command
export class CreateFeatureArgs {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    constructor(data: CreateFeatureArgs) {
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
    }
}

// Update Feature Command
export class UpdateFeatureArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    slug?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    constructor(data: UpdateFeatureArgs) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
    }
}

// Delete Feature Command
export class DeleteFeatureArgs {
    @IsString()
    @IsNotEmpty()
    id: string;

    constructor(data: DeleteFeatureArgs) {
        this.id = data.id;
    }
}
