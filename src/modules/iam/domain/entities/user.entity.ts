import { AccessControlStatus } from '@/common/enum';
import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Password } from '../vo/password.vo';
import { Attributes } from '../vo/attributes.vo';
import { UserCreatedEvent } from '../events/user.event';

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
}

export class UserEntity extends AggregateRoot<UserEntity, string> {
  private readonly _first_name: string;
  private readonly _last_name: string;
  private readonly _username: string;
  private readonly _password: Password;
  private readonly _email: string;
  private readonly _created_at: Date;
  private readonly _updated_at: Date;
  private readonly _status: AccessControlStatus;
  private readonly _organizations: IStaff[];
  private readonly _attributes: Attributes;
  private readonly _members: IMember[];

  private constructor(props: IUserBaseInfo) {
    super(props.id);

    this._email = props.email;
    this._password = props.password;
    this._username = props.username;
    this._last_name = props.last_name;
    this._first_name = props.first_name;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._status = AccessControlStatus.ACTIVE;
    this._organizations = props.organizations ?? [];
    this._attributes = props.attributes ?? Attributes.create({});
    this._members = props.members ?? [];
  }

  canAuthenticate() {
    return this._status === AccessControlStatus.ACTIVE;
  }

  static create(props: IUserBaseInfo) {
    const user = new UserEntity(props);
    // Add event only for new creation or reconstitution (currently used for both)
    user.addDomainEvent(
      new UserCreatedEvent({
        id: user.id.value,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        password: user.password.value,
        organizationId: '',
      }),
    );
    return user;
  }

  static update(props: IUpdateUserArgs) {}

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
