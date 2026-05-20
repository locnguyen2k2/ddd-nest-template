import { LogType, LogStatus, LogLevel, HttpMethod } from '../../domain/log.enum';

export interface CreateLogDto {
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