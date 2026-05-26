import { AccessControlStatus } from '@/common/enum';
import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Password } from '../vo/password.vo';
import { Attributes } from '../vo/attributes.vo';
import { UserCreatedEvent, UserNotifiedEvent } from '../events/user.event';

export interface IStaff {
  organization_id: string;
  status: AccessControlStatus;
  context_attributes?: Attributes;
  role_id?: string;
  department_id?: string;
  id: string;
}

export interface IMember {
  project_id: string;
  staff_id: string;
  id: string;
}

export interface IUserBaseInfo {
  first_name: string;
  last_name: string;
  username: string;
  password: Password;
  email: string;
  id: IEntityID<string>;
  status?: AccessControlStatus;
  created_at?: Date;
  updated_at?: Date;
  organizations?: IStaff[];
  attributes?: Attributes;
  members?: IMember[];
}

export interface IUpdateUserArgs {
  first_name?: string;
  last_name?: string;
  password?: string;
  status?: AccessControlStatus;
}

export class UserEntity extends AggregateRoot<UserEntity, string> {
  private _first_name: string;
  private _last_name: string;
  private _username: string;
  private _password: Password;
  private _email: string;
  private _created_at: Date;
  private _updated_at: Date;
  private _status: AccessControlStatus;
  private _organizations: IStaff[];
  private _attributes: Attributes;
  private _members: IMember[];

  private constructor(props: IUserBaseInfo) {
    super(props.id);

    this._email = props.email;
    this._password = props.password;
    this._username = props.username;
    this._last_name = props.last_name;
    this._first_name = props.first_name;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._status = props.status ?? AccessControlStatus.INACTIVE;
    this._organizations = props.organizations ?? [];
    this._attributes = props.attributes ?? Attributes.create({});
    this._members = props.members ?? [];
  }

  canAuthenticate() {
    return this._status !== AccessControlStatus.DELETED;
  }

  static create(props: IUserBaseInfo) {
    const user = new UserEntity(props);
    user.addDomainEvent(
      new UserCreatedEvent({
        id: user.id.value,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        organizationId: '',
      }),
    );
    return user;
  }

  static user(props: IUserBaseInfo) {
    const user = new UserEntity(props);
    user.addDomainEvent(
      new UserNotifiedEvent({
        id: user.id.value,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        organizationId: '',
      }),
    );
    return user;
  }

  update(props: IUpdateUserArgs) {
    if (props.first_name) {
      this._first_name = props.first_name;
    }
    if (props.last_name) {
      this._last_name = props.last_name;
    }
    if (props.status) {
      this._status = props.status;
    }
  }

  get first_name() {
    return this._first_name;
  }
  get last_name() {
    return this._last_name;
  }
  get username() {
    return this._username;
  }
  get password() {
    return this._password;
  }
  get email() {
    return this._email;
  }
  get created_at() {
    return this._created_at;
  }
  get updated_at() {
    return this._updated_at;
  }
  get status() {
    return this._status;
  }
  get organizations() {
    return this._organizations;
  }
  get attributes() {
    return this._attributes;
  }
  get members() {
    return this._members;
  }
}
