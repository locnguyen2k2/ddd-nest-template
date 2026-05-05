export class CreateEnvironmentCommand {
    name!: string;
    slug!: string;
    description?: string;
}

export class UpdateEnvironmentCommand {
    id!: string;
    name?: string;
    slug?: string;
    description?: string;
}

export class DeleteEnvironmentCommand {
    id!: string;
}

export class GetEnvironmentByIdQuery {
    id!: string;
}

export class GetEnvironmentBySlugQuery {
    slug!: string;
}
