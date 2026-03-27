import { Module } from '@nestjs/common';
import { CacheModule as NestedCacheModule } from '@nestjs/cache-manager'
import { ConfigKeyPaths, IRedisConfig, redisConfigKey } from '@/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheAdapter } from './adapters/cache.adapter';
import { CACHE_PORT } from '../application/ports/cache.port';

@Module({
    imports: [NestedCacheModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService<ConfigKeyPaths>) => {
            const configs = configService.get<IRedisConfig>(redisConfigKey) as IRedisConfig;
            const options = {
                socket: {
                    host: configs.host,
                    port: configs.port,
                    reconnectStrategy: () => 1000 * configs.timeout,
                },
                disableOfflineQueue: true,
                password: configs.password,
            };

            const store = await redisStore(options);
            const redisClient = store.getClient();
            const restartRedisService = async () => {
                await redisClient.disconnect();
                await redisClient.connect();
            };

            redisClient.on('error', (error) => {
                console.log({ err: error.message }, 'redis.connection.error');
                // Redis reconnection
                if (!error.code) setTimeout(restartRedisService, 1000 * configs.timeout);
            });

            return {
                isGlobal: true,
                store: store,
            };
        },
        inject: [ConfigService],
    })],
    providers: [CacheAdapter,
        {
            provide: CACHE_PORT,
            useClass: CacheAdapter
        }
    ],
    exports: [CacheAdapter, CACHE_PORT],
})
export class CacheModule { }
