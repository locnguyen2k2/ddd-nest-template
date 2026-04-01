import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@/shared/infrastructure/cache.module';
import { SwaggerModule } from '@/shared/infrastructure/swagger.module';
// import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig } from '@/config';
import { AblyModule } from './infrastructure/ably.module';
import { JwtModule } from './infrastructure/jwt.module';
import { PrismaAdapter } from './infrastructure/adapters/prisma.adapter';

@Global()
@Module({
  imports: [
    // NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()),
    CacheModule,
    SwaggerModule,
    AblyModule,
    JwtModule,
  ],
  providers: [PrismaAdapter],
  exports: [CacheModule, SwaggerModule, AblyModule, JwtModule, PrismaAdapter],
})
export class SharedModules { }
