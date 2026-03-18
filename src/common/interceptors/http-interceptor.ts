import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();
        const status = exception.getStatus();
        const message =
            (typeof exception.getResponse() === 'object' &&
                Array.isArray(exception.getResponse()['message']) &&
                exception.getResponse()['message'][0]) ||
            exception.getResponse()['message'];
        response.status(status).send({
            statusCode: status,
            success: false,
            message: message ? message : exception.message,
            ...(exception.getResponse()['data'] && {
                data: exception.getResponse()['data'],
            }),
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
