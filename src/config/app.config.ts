import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';

export const appConfigKey = 'app';

export const AppConfig = registerAs(appConfigKey, () => ({
  port: env.numb('APP_PORT', 3000),
  host: env.str('APP_HOST', 'localhost'),
  nodeEnv: env.str('NODE_ENV', 'development'),
  basicAuthUsername: env.str('BASIC_AUTH_USERNAME'),
  basicAuthPassword: env.str('BASIC_AUTH_PASSWORD'),
}));

export type IAppConfig = ConfigType<typeof AppConfig>;
