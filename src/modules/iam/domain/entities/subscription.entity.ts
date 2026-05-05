import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';

export interface ISubscriptionBaseInfo {
    id: IEntityID<string>;
    name: string;
    slug: string;
    description?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

export class SubscriptionEntity extends AggregateRoot<SubscriptionEntity, string> {
    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string | null;
    private readonly _created_at: Date | null;
    private readonly _updated_at: Date | null;

    private constructor(props: ISubscriptionBaseInfo) {
        super(props.id);
        this._name = props.name;
        this._slug = props.slug;
        this._description = props.description ?? null;
        this._created_at = props.created_at ?? null;
        this._updated_at = props.updated_at ?? null;
    }

    static create(props: ISubscriptionBaseInfo): SubscriptionEntity {
        return new SubscriptionEntity(props);
    }

    get name(): string {
        return this._name;
    }

    get slug(): string {
        return this._slug;
    }

    get description(): string | null {
        return this._description;
    }

    get created_at(): Date | null {
        return this._created_at;
    }

    get updated_at(): Date | null {
        return this._updated_at;
    }
}
