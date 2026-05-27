import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LogCmdHandler } from '../../application/services/log/command.handler';
import { LogType, LogStatus, LogLevel, HttpMethod } from '../../domain/log.enum';
import { IPayload } from '@/modules/iam/domain/services/auth.service';

@Injectable()
export class PersistentLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logCmdHandler: LogCmdHandler) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();
    const headers = request.headers;

    if (request.url.includes('/system/logs') || request.url.includes('/health')) {
      return next.handle();
    }

    const now = Date.now();
    const attributes: any = {
      organization_id: headers['organization-id'] as string,
      project_id: headers['project-id'] as string,
    }
    const userInfo: IPayload = context.getArgs()[0].user;

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.saveLog(request, response, Date.now() - now, LogStatus.SUCCESS, LogLevel.INFO, attributes, userInfo);
        },
        error: (error) => {
          this.saveLog(request, response, Date.now() - now, LogStatus.FAILURE, LogLevel.ERROR, attributes, userInfo, error);
        },
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private async saveLog(
    request: FastifyRequest,
    response: FastifyReply,
    duration: number,
    status: LogStatus,
    level: LogLevel,
    attributes: any = {},
    userInfo: IPayload,
    error?: any,
  ) {
    try {
      await this.logCmdHandler.create({
        created_by: userInfo?.sub || 'SYSTEM',
        context: 'HTTP_INTERCEPTOR',
        type: userInfo?.sub ? LogType.USER : LogType.SYSTEM,
        status: status,
        level: level,
        is_http: true,
        http_method: request.method as HttpMethod,
        path: request.url,
        status_code: error?.status || response.statusCode,
        request_id: request.headers['x-request-id'] as string,
        trace_id: request.headers['x-trace-id'] as string,
        ip: this.getClientIp(request),
        user_agent: request.headers['user-agent'] as string,
        action: `${request.method} ${request.url}`,
        attributes,
        stack: error?.stack,
        duration: duration,
      });
    } catch (err) {
      console.error('Failed to save log to MongoDB:', err);
    }
  }

  private getClientIp(request: FastifyRequest): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || 'Unknown';
  }
}
