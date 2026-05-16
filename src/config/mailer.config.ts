import { env, cwd } from '@/utils/env';
import { ConfigType, registerAs } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

const path = require('path');

export const mailerConfigKey = 'mailer';

// Khởi tạo và đặt tên (registerAs) cho Mailer configuration object
export const MailerConfig = registerAs(mailerConfigKey, () => ({
  transport: {
    service: env.str('MAILER_SERVICE'),
    auth: {
      user: env.str('MAILER_USER'),
      pass: env.str('MAILER_PASSWORD'),
    },
  },
  template: {
    dir: path.join(cwd, 'dist/public/templates/mailers'),
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
}));

export type IMailerConfig = ConfigType<typeof MailerConfig>;
