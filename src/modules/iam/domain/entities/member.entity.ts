import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus } from '@/common/enum';
import { Attributes } from '../vo/attributes.vo';

export interface MemberBaseProps {
  status?: AccessControlStatus;
  created_at?: Date;
  updated_at?: Date;
  staff_id: string;
  project_id: string;
  attributes: Attributes;
}

export interface CreateMemberProps extends MemberBaseProps {
  id: IEntityID<string>;
}

export interface UpdateMemberProps {
  status?: AccessControlStatus;
}

export class Member extends AggregateRoot<Member, string> {
  private _status?: AccessControlStatus;
  private _created_at?: Date;
  private _updated_at?: Date;
  private _staff_id: string;
  private _project_id: string;
  private _attributes: Attributes;

  private constructor(props: CreateMemberProps) {
    super(props.id);
    this._status = props.status ?? AccessControlStatus.ACTIVE;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._staff_id = props.staff_id;
    this._project_id = props.project_id;
    this._attributes = props.attributes;
  }

  static create(props: CreateMemberProps) {
    const member = new Member(props);

    return member;
  }

  update(props: UpdateMemberProps) {
    const oldStatus = this._status;

    if (props.status !== undefined) {
      this._status = props.status;
    }

    this._updated_at = new Date();
  }

  delete() {}

  get attributes() {
    return this._attributes;
  }

  get status(): AccessControlStatus {
    return this._status!;
  }

  get created_at(): Date {
    return this._created_at!;
  }

  get updated_at(): Date {
    return this._updated_at!;
  }

  get staff_id(): string {
    return this._staff_id!;
  }

  get project_id(): string {
    return this._project_id!;
  }
}
