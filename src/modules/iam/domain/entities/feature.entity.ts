import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
import { FeatureCreatedEvent, FeatureUpdatedEvent, FeatureDeletedEvent } from '../events/feature.events';

export interface FeatureBaseProps {
    name: string;
    slug: Slug;
    description?: string;
    is_enabled?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateFeatureProps extends FeatureBaseProps {
    id: IEntityID<string>;
}

export interface UpdateFeatureProps {
    name?: string;
    slug?: Slug;
    description?: string;
    is_enabled?: boolean;
}

// Feature Aggregate Root
export class Feature extends AggregateRoot<Feature, string> {
    private constructor(
        public readonly id: IEntityID<string>,
        private name: string,
        private slug: Slug,
        private description?: string,
        private is_enabled: boolean = true,
        private created_at: Date = new Date(),
        private updated_at: Date = new Date(),
    ) {
        super(id);
    }

    static create(props: CreateFeatureProps) {
        const feature = new Feature(
            props.id,
            props.name,
            props.slug,
            props.description,
            props.is_enabled ?? true,
            props.created_at ?? new Date(),
            props.updated_at ?? new Date()
        );
        feature.addDomainEvent(new FeatureCreatedEvent({
            id: props.id.value,
            name: props.name,
            slug: props.slug.value,
            description: props.description,
            is_enabled: props.is_enabled ?? true,
            createdAt: props.created_at ?? new Date(),
            updatedAt: props.updated_at ?? new Date(),
        }));
        return feature;
    }

    update(props: UpdateFeatureProps) {
        const oldName = this.name;
        const oldSlug = this.slug;
        const oldDescription = this.description;
        const oldIsEnabled = this.is_enabled;

        if (props.name !== undefined) {
            this.name = props.name;
        }
        if (props.slug !== undefined) {
            this.slug = props.slug;
        }
        if (props.description !== undefined) {
            this.description = props.description;
        }
        if (props.is_enabled !== undefined) {
            this.is_enabled = props.is_enabled;
        }

        this.updated_at = new Date();

        this.addDomainEvent(new FeatureUpdatedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            is_enabled: this.is_enabled,
            oldName,
            oldSlug: oldSlug.value,
            oldDescription,
            oldIsEnabled,
            updatedAt: this.updated_at,
        }));
    }

    delete() {
        this.addDomainEvent(new FeatureDeletedEvent({
            id: this.id.value,
            name: this.name,
            slug: this.slug.value,
            description: this.description,
            isDeleted: true,
            updatedAt: new Date(),
        }));
    }

    // Getters
    getName(): string {
        return this.name;
    }

    getSlug(): Slug {
        return this.slug;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    getIsEnabled(): boolean {
        return this.is_enabled;
    }

    getCreatedAt(): Date {
        return this.created_at;
    }

    getUpdatedAt(): Date {
        return this.updated_at;
    }
}
