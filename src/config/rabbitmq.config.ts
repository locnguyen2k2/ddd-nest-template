import { registerAs } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';
import { env } from '@/utils/env';

export const rabbitmqConfigKey = 'rabbitmq';
export const RabbitMQConfig = registerAs(rabbitmqConfigKey, () => ({
  url: env.str('RABBITMQ_URL', 'amqp://localhost:5672'),
  user: env.str('RABBITMQ_USER', 'guest'),
  pass: env.str('RABBITMQ_PASS', 'guest'),
  host: env.str('RABBITMQ_HOST', 'localhost'),
  vhost: env.str('RABBITMQ_VHOST', '/'),
  replica: env.str('RABBITMQ_REPLICA', '1'),
}));

export type IRabbitMQConfig = ConfigType<typeof RabbitMQConfig>;