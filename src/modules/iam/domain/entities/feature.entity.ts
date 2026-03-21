import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
import { FeatureCreatedEvent, FeatureUpdatedEvent, FeatureDeletedEvent } from '../events/feature.events';

export interface FeatureBaseProps {
    name: string;
    slug: Slug;
    description?: string;
}

export interface CreateFeatureProps extends FeatureBaseProps {
    id: IEntityID<string>;
}

export interface UpdateFeatureProps {
    name?: string;
    slug?: Slug;
    description?: string;
}

// Feature Aggregate Root
export class Feature extends AggregateRoot<Feature, string> {
    private constructor(
        public readonly id: IEntityID<string>,
        private name: string,
        private slug: Slug,
        private description?: string,
    ) {
        super(id);
    }

    static create(props: CreateFeatureProps) {
        const feature = new Feature(props.id, props.name, props.slug, props.description);
        feature.addDomainEvent(new FeatureCreatedEvent({
            id: props.id.value,
            name: props.name,
            slug: props.slug.value,
            description: props.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        return feature;
    }

    update(props: UpdateFeatureProps) {
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

        this.addDomainEvent(new FeatureUpdatedEvent({
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
}
