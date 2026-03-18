import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@/shared/infrastructure/cache/cache.module";
import { SwaggerModule } from "@/shared/infrastructure/swagger/swagger.module";
import {
    ThrottlerModule as NestThrottlerModule,
} from '@nestjs/throttler';
import { ThrottlerConfig } from '@/config';
import { AblyModule } from "./infrastructure/ably/ably.module";

@Global()
@Module({
    imports: [NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()), CacheModule, SwaggerModule, AblyModule],
    exports: [CacheModule, SwaggerModule, AblyModule],
})
export class SharedModules { }