import { applyDecorators, createParamDecorator, SetMetadata } from '@nestjs/common';
import { KEYS } from '../constant';

export const HeaderKey = (...headers: string[]) =>
    applyDecorators(SetMetadata(KEYS.HEADERS, headers));

export const GetHeaderKey = createParamDecorator(
    (data: string, req) => req.switchToHttp().getRequest().headers[data],
);
