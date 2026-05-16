import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ErrorEnum } from '@/common/exception.enum';
import { BusinessException } from '@/common/http/business-exception';
import { ExtractJwt } from 'passport-jwt';
import { AuthCmdHandler } from '../../application/services/auth/command.handler';
import { IPayload } from '../../domain/services/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken();

  constructor(private readonly authCmdHandler: AuthCmdHandler) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const token = this.jwtFromRequestFn(request);
    if (!token) {
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
    request.accessToken = token;

    try {
      const userInfo = await this.authCmdHandler.verifyAccessToken({
        accessToken: token,
      });
      const result: IPayload = {
        sub: userInfo.id,
        email: userInfo.email,
        username: userInfo.username,
      };
      request.user = result;
      return true;
    } catch (e) {
      console.log(e);
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }
}
