import { LogEntity } from '@/modules/system/logs/domain/entities/log.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Logs, Prisma } from '@internal/mongodb/client';
import { LogType, LogStatus, LogLevel, HttpMethod } from '@/modules/system/logs/domain/log.enum';

export class LogMapper {
  static toDomain(props: Logs): LogEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return LogEntity.create({
      id: id,
      created_at: props.created_at,
      created_by: props.created_by ?? undefined,
      context: props.context ?? undefined,
      type: props.type as LogType,
      status: props.status as LogStatus,
      level: props.level as LogLevel,
      is_http: props.is_http,
      http_method: props.http_method as HttpMethod ?? undefined,
      path: props.path ?? undefined,
      status_code: props.status_code ?? undefined,
      request_id: props.request_id ?? undefined,
      trace_id: props.trace_id ?? undefined,
      ip: props.ip ?? undefined,
      user_agent: props.user_agent ?? undefined,
      action: props.action,
      reason: props.reason ?? undefined,
      attributes: props.attributes,
      before: props.before,
      after: props.after,
      stack: props.stack ?? undefined,
      duration: props.duration ?? undefined,
      service: props.service ?? undefined,
    });
  }

  static toPrisma(props: LogEntity): Prisma.LogsCreateInput {
    return {
      created_at: props.created_at,
      created_by: props.created_by,
      context: props.context,
      type: props.type,
      status: props.status,
      level: props.level,
      is_http: props.is_http,
      http_method: props.http_method,
      path: props.path,
      status_code: props.status_code,
      request_id: props.request_id,
      trace_id: props.trace_id,
      ip: props.ip,
      user_agent: props.user_agent,
      action: props.action,
      reason: props.reason,
      attributes: props.attributes as Prisma.JsonValue,
      before: props.before as Prisma.JsonValue,
      after: props.after as Prisma.JsonValue,
      stack: props.stack,
      duration: props.duration,
      service: props.service,
    };
  }
}
