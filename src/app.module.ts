import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from '@/config';
import { SharedModules } from '@/shared/shared.modules';
import { ScheduleModule } from '@nestjs/schedule';
import { IamModule } from '@/modules/iam/iam.module';

const modules = [IamModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [`.env.local`, `.env.${process.env.NODE_ENV}`, '.env'], // Load more env files
      load: [...Object.values(configs)], // Loading configure objects
    }),

    ScheduleModule.forRoot(),
    SharedModules,
    ...modules,
  ],

  providers: [
    // // JWT Guard
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // // Graphql Guard
    // { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    // // Role-base access control authorization
    // { provide: APP_GUARD, useClass: RbacAuthGuard },
  ],
})
export class AppModule {}
