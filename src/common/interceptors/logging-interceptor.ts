import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { throwError } from 'rxjs';

const Icons = {
    request: '🚀',
    response: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '🎉',
    time: '⏱️',
    method: '📡',
    status: '📊',
    user: '👤',
    ip: '🌐',
};

interface RequestLog {
    method: string;
    url: string;
    ip: string;
    userAgent: string;
    timestamp: string;
    requestId?: string;
    userId?: string;
}

interface ResponseLog extends RequestLog {
    duration: number;
    statusCode: number;
    contentLength?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyReply>();

        const now = Date.now();
        const timestamp = new Date().toISOString();

        const requestLog: RequestLog = {
            method: request.method,
            url: request.url,
            ip: this.getClientIp(request),
            userAgent: request.headers['user-agent'] || 'Unknown',
            timestamp,
            requestId: request.headers['x-request-id'] as string,
            userId: (request as any).user?.id,
        };

        this.logRequest(requestLog);

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - now;
                    const responseLog: ResponseLog = {
                        ...requestLog,
                        duration,
                        statusCode: response.statusCode,
                        contentLength: response.getHeader('content-length') as string,
                    };

                    this.logResponse(responseLog);
                },
                error: (error) => {
                    const duration = Date.now() - now;
                    const responseLog: ResponseLog = {
                        ...requestLog,
                        duration,
                        statusCode: error.status || 500,
                    };

                    this.logError(responseLog, error);
                },
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    private getClientIp(request: FastifyRequest): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || 'Unknown';
    }

    private logRequest(log: RequestLog): void {
        const requestLine = [
            `${Icons.request} REQ`,
            `${log.method.padEnd(7)}`,
            `${log.url}`,
            `${Icons.ip} ${log.ip}`,
            log.userId ? `${Icons.user} ${log.userId}` : '',
            log.requestId ? `${Icons.info} ${log.requestId}` : '',
        ].filter(Boolean).join(' ');

        console.log(requestLine);
    }

    private logResponse(log: ResponseLog): void {
        const statusEmoji = this.getStatusEmoji(log.statusCode);
        const durationEmoji = this.getDurationEmoji(log.duration);

        const responseLine = [
            `${Icons.response} RES`,
            `${log.method.padEnd(7)}`,
            `${log.url}`,
            `${log.statusCode} ${statusEmoji}`,
            `${log.duration}ms ${durationEmoji}`,
            log.contentLength ? `${this.formatBytes(parseInt(log.contentLength))}` : '',
        ].filter(Boolean).join(' ');

        console.log(responseLine);
    }

    private logError(log: ResponseLog, error: any): void {
        const errorLine = [
            `${Icons.error} ERR`,
            `${log.statusCode} ❌`,
            `${log.duration}ms`,
            `${error.message}`,
        ].filter(Boolean).join(' ');

        console.log(errorLine);

        if (process.env.NODE_ENV !== 'production' && error.stack) {
            console.log(error.stack);
        }
    }

    private getStatusEmoji(status: number): string {
        if (status >= 200 && status < 300) return '✅';
        if (status >= 300 && status < 400) return '↪️';
        if (status >= 400 && status < 500) return '⚠️';
        if (status >= 500) return '❌';
        return '📊';
    }

    private getDurationEmoji(duration: number): string {
        if (duration < 100) return '⚡';
        if (duration < 300) return '🚀';
        if (duration < 500) return '✓';
        if (duration < 1000) return '⚠️';
        return '🐢';
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
}
