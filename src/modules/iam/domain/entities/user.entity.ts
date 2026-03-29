import { AccessControlStatus } from '@/common/enum';
import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';

export interface IUserBaseInfo {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  email: string;
  id: IEntityID<string>;
  created_at?: Date;
  updated_at?: Date;
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
  private readonly _password: string;
  private readonly _email: string;
  private readonly _created_at: Date;
  private readonly _updated_at: Date;
  private readonly _status: AccessControlStatus;

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
  }

  static create(props: IUserBaseInfo) {
    return new UserEntity(props);
  }

  static update(props: IUpdateUserArgs) {}

  firstName() {
    return this._first_name;
  }
  lastName() {
    return this._last_name;
  }
  username() {
    return this._username;
  }
  password() {
    return this._password;
  }
  email() {
    return this._email;
  }
  createdAt() {
    return this._created_at;
  }
  updatedAt() {
    return this._updated_at;
  }
  status() {
    return this._status;
  }
}
