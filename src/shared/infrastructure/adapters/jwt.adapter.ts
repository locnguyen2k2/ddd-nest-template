import { Injectable } from '@nestjs/common';
import { JwtPort, JwtSignOptions } from '@/shared/application/ports/jwt.port';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths, IJwtConfig, jwtConfigKey, JwtConfig } from '@/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAdapter implements JwtPort {
  private readonly jwtConfigs: IJwtConfig;

  constructor(configService: ConfigService<ConfigKeyPaths>) {
    this.jwtConfigs = configService.get<IJwtConfig>(jwtConfigKey) as IJwtConfig;
  }

  sign(payload: any, options?: JwtSignOptions): string {
    const secret = options?.secret || this.jwtConfigs.secret;
    const expiresIn = options?.expiresIn || this.jwtConfigs.expiresIn;
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify<T extends object>(token: string, options?: { secret?: string }): T {
    const secret = options?.secret || this.jwtConfigs.secret;
    return jwt.verify(token, secret) as T;
  }

  decode<T>(token: string): T {
    return jwt.decode(token) as T;
  }
}
