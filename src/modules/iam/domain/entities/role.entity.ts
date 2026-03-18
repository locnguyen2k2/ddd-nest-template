import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { Slug } from "../vo/slug.vo";
import { RoleCreatedEvent, RoleUpdatedEvent, RoleDeletedEvent } from "../events/role.events";

export interface IRoleProps {
    name: string;
    slug: Slug;
    description?: string;
}

export interface CreateRoleProps extends IRoleProps {
    id: IEntityID<string>;
}

export interface UpdateRoleProps {
    name?: string;
    slug?: Slug;
    description?: string;
}

export class RoleEntity extends AggregateRoot<RoleEntity, string> {
    private name: string;
    private slug: Slug;
    private description?: string;

    private constructor(readonly id: IEntityID<string>, props: IRoleProps) {
        super(id);
        this.name = props.name;
        this.slug = props.slug;
        this.description = props.description;
    }

    static create(props: CreateRoleProps): RoleEntity {
        const role = new RoleEntity(props.id, {
            name: props.name,
            slug: props.slug,
            description: props.description,
        });
        role.addDomainEvent(new RoleCreatedEvent({
            id: props.id.value,
            name: props.name,
            slug: props.slug.value,
            description: props.description,
            createdAt: new Date(),
        }));
        return role;
    }

    update(props: UpdateRoleProps) {
        const oldName = this.name;
        const oldSlug = this.slug;
        const oldDescription = this.description;

        if (props.name !== undefined) {
            this.name = props.name;
        }
        if (props.slug !== undefined) {
            this.slug = props.slug;
        }
        if (props.description !== undefined) {
            this.description = props.description;
        }

        this.addDomainEvent(new RoleUpdatedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            oldName,
            oldSlug: oldSlug.value,
            oldDescription,
            updatedAt: new Date(),
        }));
    }

    delete() {
        this.addDomainEvent(new RoleDeletedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            isDeleted: true,
            updatedAt: new Date(),
        }));
    }

    getName(): string {
        return this.name;
    }

    getSlug(): Slug {
        return this.slug;
    }

    getDescription(): string | undefined {
        return this.description;
    }
}