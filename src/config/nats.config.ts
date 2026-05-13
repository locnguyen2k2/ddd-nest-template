import { registerAs } from "@nestjs/config";

import { ConfigType } from '@nestjs/config';
import { env } from '@/utils/env';

export const natsConfigKey = 'nats';
export const NatsConfig = registerAs(natsConfigKey, () => ({
    url: env.str('NATS_URL'),
    user: env.str('NATS_USER'),
    pass: env.str('NATS_PASS'),
}));

export type INatsConfig = ConfigType<typeof NatsConfig>;