import { AccessControlStatus } from '@/common/enum';
import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Password } from '../vo/password.vo';
import { UserService } from '../services/user.service';

export interface IOrgRoles {
  organization_id: string;
  role_ids: string[];
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
  organization_roles?: IOrgRoles[];
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
  private readonly _org_roles: IOrgRoles[];

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
    this._org_roles = props.organization_roles ?? [];
  }

  canAuthenticate() {
    return this._status === AccessControlStatus.ACTIVE;
  }

  validateCredentials(password: string) {
    if (!this._password.match(password)) {
      return false;
    }
    return this.canAuthenticate();
  }

  static create(props: IUserBaseInfo) {
    return new UserEntity(props);
  }

  static update(props: IUpdateUserArgs) { }

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
  get org_roles() {
    return this._org_roles;
  }
}
