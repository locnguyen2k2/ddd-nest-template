import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ErrorEnum } from "@/common/exception.enum";
import { BusinessException } from "@/common/http/business-exception";
import { ExtractJwt } from "passport-jwt";
import { AuthCmdHandler } from "../../application/services/auth/auth.command.handler";
import { IPayload } from "../../domain/services/auth.service";
import { VerifyAccessTokenArgs } from "../../application/dtos/commands/auth-cmd.dto";
import { HeaderKeys, KEYS } from "@/common/constant";
import { Reflector } from "@nestjs/core";
import { UserQueryHandler } from "../../application/services/user/user.query.handler";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken();

    constructor(
        private readonly reflector: Reflector,
        private readonly authCmdHandler: AuthCmdHandler,
        private readonly userQueryHandler: UserQueryHandler,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();

        const token = this.jwtFromRequestFn(request);
        request.accessToken = token;

        const validPermissions = this.reflector.getAllAndOverride<
            string | string[]
        >(KEYS.PERMISSIONS, [context.getHandler(), context.getClass()]);
        let requiredPermissions: string[] = [];
        if (validPermissions) {
            requiredPermissions = Array.isArray(validPermissions)
                ? validPermissions
                : [validPermissions];
        }

        let result: IPayload | null = null;
        try {
            const [userInfo] = await Promise.all([
                this.authCmdHandler.verifyAccessToken(new VerifyAccessTokenArgs(token)),
            ]);
            result = {
                sub: userInfo.id,
                email: userInfo.email,
                username: userInfo.username,
            };

            if (requiredPermissions.length > 0) {
                const orgId = this.extractOrgIdFromHeader(request);
                const projectId = this.extractProjectIdFromHeader(request);
                const hasPermission = await this.userQueryHandler.hasPermission(userInfo.id, requiredPermissions, orgId || '', projectId || '');
                if (!hasPermission) {
                    throw new BusinessException(ErrorEnum.ACCESS_DENIED);
                }
            }
        } catch (e) {
            console.log(e);
            throw new BusinessException(ErrorEnum.UNAUTHORIZED);
        }

        request.user = result;

        return !!result;
    }

    private extractOrgIdFromHeader(request: any): string | null {
        return request.headers[HeaderKeys.ORG_ID] || null;
    }

    private extractProjectIdFromHeader(request: any): string | null {
        return request.headers[HeaderKeys.PROJECT_ID] || null;
    }
}
