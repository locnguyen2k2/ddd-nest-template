import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { Slug } from "../vo/slug.vo";
import { OrganizationCreatedEvent, OrganizationUpdatedEvent, OrganizationDeletedEvent } from "../events/organization.events";

export interface IOrganizationProps {
    name: string;
    slug: Slug;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateOrganizationProps extends IOrganizationProps {
    id: IEntityID<string>;
}

export interface IUpdateOrganizationProps {
    name?: string;
    slug?: Slug;
    description?: string;
}

export class Organization extends AggregateRoot<Organization, string> {
    private name: string;
    private slug: Slug;
    private description?: string;
    private created_at: Date;
    private updated_at: Date;

    private constructor(id: IEntityID<string>, props: IOrganizationProps) {
        super(id);
        this.name = props.name;
        this.slug = props.slug;
        this.description = props.description;
        this.created_at = props.created_at ?? new Date();
        this.updated_at = props.updated_at ?? new Date();
    }

    static create(props: ICreateOrganizationProps): Organization {
        const now = new Date();
        const organization = new Organization(props.id, {
            name: props.name,
            slug: props.slug,
            description: props.description,
            created_at: now,
            updated_at: now,
        });
        organization.addDomainEvent(new OrganizationCreatedEvent({
            id: props.id.value,
            name: props.name,
            slug: props.slug.value,
            description: props.description,
            createdAt: now,
            updatedAt: now,
        }));

        return organization;
    }

    update(props: IUpdateOrganizationProps) {
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

        this.updated_at = new Date();

        this.addDomainEvent(new OrganizationUpdatedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            oldName,
            oldSlug: oldSlug.value,
            oldDescription,
            updatedAt: this.updated_at,
        }));
    }

    delete() {
        const now = new Date();
        this.addDomainEvent(new OrganizationDeletedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            isDeleted: true,
            updatedAt: now,
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

    getCreatedAt(): Date {
        return this.created_at;
    }

    getUpdatedAt(): Date {
        return this.updated_at;
    }
}
