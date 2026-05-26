import { env } from '@/utils/env';
import { registerAs } from '@nestjs/config';

export const jwtConfigKey = 'jwt';

export interface IJwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export const JwtConfig = registerAs(
  jwtConfigKey,
  (): IJwtConfig => ({
    secret: env.str('JWT_SECRET') || 'secret',
    expiresIn: env.str('JWT_EXPIRES_IN') || '1d',
    refreshSecret: env.str('JWT_REFRESH_SECRET') || 'refresh_secret',
    refreshExpiresIn: env.str('JWT_REFRESH_EXPIRES_IN') || '7d',
  }),
);
