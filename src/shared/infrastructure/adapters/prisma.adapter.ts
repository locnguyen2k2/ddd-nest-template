import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@internal/rbac/client';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths, databaseConfigKey, IDatabaseConfig } from '@/config';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaAdapter
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService<ConfigKeyPaths>) {
    const rbacURL =
      configService.get<IDatabaseConfig>(databaseConfigKey)?.rbac?.url;
    super({
      adapter: new PrismaPg({ connectionString: rbacURL }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
