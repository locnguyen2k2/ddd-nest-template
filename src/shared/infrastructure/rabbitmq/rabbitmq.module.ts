import { Global, Module } from '@nestjs/common';
import { RabbitMQAdapter } from '../adapters/rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { IRabbitMQConfig, rabbitmqConfigKey } from '@/config/rabbitmq.config';
import * as amqp from 'amqp-connection-manager';
import { RabbitMQManagementService } from './rabbitmq-management.service';
import { QUEUE_MANAGER_PORT } from '../../application/ports/queue-manager.port';
import { CacheModule } from '../cache.module';
import { RABBITMQ_CONNECTION } from '../adapters/rabbitmq.service';
import { ConfigKeyPaths } from '@/config';
import { BusinessException } from '@/common/http/business-exception';

@Global()
@Module({
  imports: [CacheModule],
  providers: [
    {
      provide: RABBITMQ_CONNECTION,
      useFactory: (configService: ConfigService<ConfigKeyPaths>) => {
        const config = configService.get<IRabbitMQConfig>(rabbitmqConfigKey);
        if (!config) {
          throw new BusinessException('404|RabbitMQ config not found');
        }
        const connection = amqp.connect([config.url]);
        connection.on('connect', () => {
          console.log('RabbitMQ connection established');
        });
        return connection;
      },
      inject: [ConfigService],
    },
    RabbitMQAdapter,
    {
      provide: QUEUE_MANAGER_PORT,
      useClass: RabbitMQManagementService,
    },
  ],
  exports: [RABBITMQ_CONNECTION, RabbitMQAdapter, QUEUE_MANAGER_PORT],
})
export class RabbitMQModule { }