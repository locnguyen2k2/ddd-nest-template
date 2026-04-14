import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@/shared/infrastructure/cache.module';
import { SwaggerModule } from '@/shared/infrastructure/swagger.module';
import { AblyModule } from './infrastructure/ably.module';
import { JwtModule } from './infrastructure/jwt.module';
import { PrismaAdapter } from './infrastructure/adapters/prisma.adapter';
import { BcryptAdapter } from './infrastructure/adapters/bcrypt.adapter';
import { BCRYPT_PORT } from './application/ports/bcrypt.port';
import { JSON_LOGIC_ENGINE } from './application/ports/json-log-engine.port';
import { JsonLogicEngineAdapter } from './infrastructure/adapters/json-logic.adapter';

@Global()
@Module({
  imports: [
    // NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()),
    CacheModule,
    SwaggerModule,
    AblyModule,
    JwtModule,
  ],
  providers: [PrismaAdapter, BcryptAdapter, JsonLogicEngineAdapter,
    {
      provide: BCRYPT_PORT,
      useClass: BcryptAdapter,
    },
    {
      provide: JSON_LOGIC_ENGINE,
      useClass: JsonLogicEngineAdapter,
    }
  ],
  exports: [CacheModule, SwaggerModule, AblyModule, JwtModule, PrismaAdapter, BcryptAdapter, JsonLogicEngineAdapter],
})
export class SharedModules { }
