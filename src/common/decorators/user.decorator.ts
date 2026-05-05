/* Get currently user */
import { createParamDecorator } from '@nestjs/common';
import { IPayload } from '@/modules/iam/domain/services/auth.service';

// @ts-ignore
export const User = createParamDecorator((data, ctx: any) => {
    const userInfo: IPayload = ctx.args[0].user;
    return {
        ...userInfo,
    };
});
