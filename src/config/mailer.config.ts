import { env, cwd } from '@/utils/env';
import { ConfigType, registerAs } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

const path = require('path');

export const mailerConfigKey = 'mailer';

// Khởi tạo và đặt tên (registerAs) cho Mailer configuration object
export const MailerConfig = registerAs(mailerConfigKey, () => ({
  transport: {
    host: env.str('MAILER_HOST', 'smtp.gmail.com'),
    port: env.numb('MAILER_PORT', 587),
    secure: env.bool('MAILER_SECURE', false),
    family: 4,
    auth: {
      user: env.str('MAILER_USER'),
      pass: env.str('MAILER_PASSWORD'),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  },
  template: {
    dir: path.join(cwd, 'dist/public/templates/mailers'),
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
}));

export type IMailerConfig = ConfigType<typeof MailerConfig>;
