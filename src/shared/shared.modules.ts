import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@/shared/infrastructure/cache.module';
import { SwaggerModule } from '@/shared/infrastructure/swagger.module';
import { AblyModule } from './infrastructure/ably.module';
import { JwtModule } from './infrastructure/jwt.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { PrismaAdapter } from './infrastructure/adapters/prisma.adapter';
import { BcryptAdapter } from './infrastructure/adapters/bcrypt.adapter';
import { BCRYPT_PORT } from './application/ports/bcrypt.port';
import { JSON_LOGIC_ENGINE } from './application/ports/json-log-engine.port';
import { JsonLogicEngineAdapter } from './infrastructure/adapters/json-logic.adapter';
import { MailerModule } from './infrastructure/mailer.module';
import { MAILER_PORT } from './application/ports/mailer.port';
import { MailerAdapter } from './infrastructure/adapters/mailer.adapter';
import { ThrottleModule } from './infrastructure/throttle.module';
import { RequestAdapter } from './infrastructure/adapters/http.adapter';
import { REQUEST_PORT } from './application/ports/http.port';

@Global()
@Module({
  imports: [
    // NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()),
    CacheModule,
    SwaggerModule,
    AblyModule,
    JwtModule,
    RabbitMQModule,
    MailerModule,
    ThrottleModule,
  ],
  providers: [
    PrismaAdapter,
    BcryptAdapter,
    MailerAdapter,
    JsonLogicEngineAdapter,
    RequestAdapter,
    {
      provide: BCRYPT_PORT,
      useClass: BcryptAdapter,
    },
    {
      provide: JSON_LOGIC_ENGINE,
      useClass: JsonLogicEngineAdapter,
    },
    {
      provide: MAILER_PORT,
      useClass: MailerAdapter,
    },
    {
      provide: REQUEST_PORT,
      useClass: RequestAdapter,
    }
  ],
  exports: [
    CacheModule,
    SwaggerModule,
    AblyModule,
    JwtModule,
    RabbitMQModule,
    MailerModule,
    ThrottleModule,
    PrismaAdapter,
    BcryptAdapter,
    JsonLogicEngineAdapter,
    RequestAdapter,
    MailerAdapter,
  ],
})
export class SharedModules { }
