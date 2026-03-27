import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@/shared/infrastructure/cache.module";
import { SwaggerModule } from "@/shared/infrastructure/swagger.module";
import {
    ThrottlerModule as NestThrottlerModule,
} from '@nestjs/throttler';
import { ThrottlerConfig } from '@/config';
import { AblyModule } from "./infrastructure/ably.module";

@Global()
@Module({
    imports: [NestThrottlerModule.forRootAsync(ThrottlerConfig.asProvider()), CacheModule, SwaggerModule, AblyModule],
    exports: [CacheModule, SwaggerModule, AblyModule],
})
export class SharedModules { }