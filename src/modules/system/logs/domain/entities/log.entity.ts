import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { LogType, LogStatus, LogLevel, HttpMethod } from '../log.enum';

export interface ILogBaseInfo {
  id: IEntityID<string>;
  created_at?: Date;
  created_by?: string;
  context?: string;
  type: LogType;
  status: LogStatus;
  level: LogLevel;
  is_http?: boolean;
  http_method?: HttpMethod;
  path?: string;
  status_code?: number;
  request_id?: string;
  trace_id?: string;
  ip?: string;
  user_agent?: string;
  action: string;
  reason?: string;
  attributes?: any;
  before?: any;
  after?: any;
  stack?: string;
  duration?: number;
  service?: string;
}

export class LogEntity extends AggregateRoot<LogEntity, string> {
  private readonly _created_at?: Date;
  private readonly _created_by?: string;
  private readonly _context?: string;
  private readonly _type: LogType;
  private readonly _status: LogStatus;
  private readonly _level: LogLevel;
  private readonly _is_http: boolean;
  private readonly _http_method?: HttpMethod;
  private readonly _path?: string;
  private readonly _status_code?: number;
  private readonly _request_id?: string;
  private readonly _trace_id?: string;
  private readonly _ip?: string;
  private readonly _user_agent?: string;
  private readonly _action: string;
  private readonly _reason?: string;
  private readonly _attributes?: any;
  private readonly _before?: any;
  private readonly _after?: any;
  private readonly _stack?: string;
  private readonly _duration?: number;
  private readonly _service?: string;

  private constructor(props: ILogBaseInfo) {
    super(props.id);
    this._created_at = props.created_at ?? undefined;
    this._created_by = props.created_by;
    this._context = props.context;
    this._type = props.type;
    this._status = props.status;
    this._level = props.level;
    this._is_http = props.is_http ?? false;
    this._http_method = props.http_method;
    this._path = props.path;
    this._status_code = props.status_code;
    this._request_id = props.request_id;
    this._trace_id = props.trace_id;
    this._ip = props.ip;
    this._user_agent = props.user_agent;
    this._action = props.action;
    this._reason = props.reason;
    this._attributes = props.attributes;
    this._before = props.before;
    this._after = props.after;
    this._stack = props.stack;
    this._duration = props.duration;
    this._service = props.service;
  }

  static create(props: ILogBaseInfo) {
    return new LogEntity(props);
  }

  get created_at() { return this._created_at; }
  get created_by() { return this._created_by; }
  get context() { return this._context; }
  get type() { return this._type; }
  get status() { return this._status; }
  get level() { return this._level; }
  get is_http() { return this._is_http; }
  get http_method() { return this._http_method; }
  get path() { return this._path; }
  get status_code() { return this._status_code; }
  get request_id() { return this._request_id; }
  get trace_id() { return this._trace_id; }
  get ip() { return this._ip; }
  get user_agent() { return this._user_agent; }
  get action() { return this._action; }
  get reason() { return this._reason; }
  get attributes() { return this._attributes; }
  get before() { return this._before; }
  get after() { return this._after; }
  get stack() { return this._stack; }
  get duration() { return this._duration; }
  get service() { return this._service; }
}
