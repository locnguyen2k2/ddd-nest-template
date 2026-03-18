import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseConfigKey, IDatabaseConfig } from '@/config/database.config';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from '@/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService<ConfigKeyPaths>) {
        const rbacURL = configService.get<IDatabaseConfig>(databaseConfigKey)?.rbac?.url;
        super({
            adapter: new PrismaPg({ connectionString: rbacURL })
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
