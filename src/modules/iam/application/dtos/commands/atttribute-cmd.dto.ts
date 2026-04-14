export class CreateAttributeCommand {
    entity_type!: string;
    key!: string;
    data_type!: string;
    description?: string;
}

export class UpdateAttributeCommand {
    id!: string;
    entity_type?: string;
    key?: string;
    data_type?: string;
    description?: string;
}

export class DeleteAttributeCommand {
    id!: string;
}

export class GetAttributeByIdQuery {
    id!: string;
}

export class GetAttributesByEntityTypeQuery {
    entity_type!: string;
}
