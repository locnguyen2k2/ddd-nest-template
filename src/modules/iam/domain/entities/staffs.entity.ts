import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Attributes } from '../vo/attributes.vo';
import { AccessControlStatus } from '@/common/enum';

export interface StaffBaseProps {
    status?: AccessControlStatus;
    created_at?: Date;
    updated_at?: Date;
    created_by: string | undefined;
    updated_by: string | undefined;
    context_attributes?: Attributes;
    user_id: string;
    organization_id: string;
    department_id?: string;
    role_id?: string;
}

export interface CreateStaffProps extends StaffBaseProps {
    id: IEntityID<string>;
}

export interface UpdateStaffProps {
    status?: AccessControlStatus;
}

// Feature Aggregate Root
export class Staffs extends AggregateRoot<Staffs, string> {
    private _status?: AccessControlStatus;
    private _created_at?: Date;
    private _updated_at?: Date;
    private _created_by: string | undefined;
    private _updated_by: string | undefined;
    private _context_attributes?: Attributes;
    private _user_id: string;
    private _organization_id: string;
    private _department_id?: string;
    private _role_id?: string;

    private constructor(
        props: CreateStaffProps,
    ) {
        super(props.id);
        this._status = props.status ?? AccessControlStatus.ACTIVE;
        this._created_at = props.created_at ?? new Date();
        this._updated_at = props.updated_at ?? new Date();
        this._user_id = props.user_id;
        this._organization_id = props.organization_id;
        this._created_by = props.created_by;
        this._updated_by = props.updated_by;
        this._context_attributes = props.context_attributes ?? Attributes.create({});
        this._department_id = props.department_id;
        this._role_id = props.role_id;
    }

    static create(props: CreateStaffProps) {
        const staff = new Staffs(props);

        return staff;
    }

    update(props: UpdateStaffProps) {
        const oldStatus = this._status;

        if (props.status !== undefined) {
            this._status = props.status;
        }

        this._updated_at = new Date();
    }

    delete() {

    }

    // Getters
    get status(): AccessControlStatus {
        return this._status!;
    }

    get createdAt(): Date {
        return this._created_at!;
    }

    get updatedAt(): Date {
        return this._updated_at!;
    }

    get orgId(): string {
        return this._organization_id!;
    }
    
    get userId(): string {
        return this._user_id!;
    }

    get createdBy(): string | undefined {
        return this._created_by;
    }

    get updatedBy(): string | undefined {
        return this._updated_by;
    }

    get attributes(): Attributes {
        return this._context_attributes!;
    }
    
    get departmentId(): string | undefined {
        return this._department_id;
    }
    
    get roleId(): string | undefined {
        return this._role_id;
    }
}
