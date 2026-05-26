import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from '@/config';
import { SharedModules } from '@/shared/shared.modules';
import { ScheduleModule } from '@nestjs/schedule';
import { IamModule } from '@/modules/iam/iam.module';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { PasswordSecurityGuard } from './modules/iam/presentation/guards/passsword-security.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { NotificationModule } from './modules/notification/notification.module';
import { LogsModule } from './modules/system/logs/logs.module';
import { PersistentLoggingInterceptor } from './modules/system/logs/presentation/interceptors/persistent-logging.interceptor';

const modules = [IamModule, NotificationModule, LogsModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // Load more env files
      load: [...Object.values(configs)], // Loading configure objects
    }),

    ScheduleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    SharedModules,
    ...modules,
  ],

  controllers: [AppController],

  providers: [
    // JWT Guard
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // // Graphql Guard
    // { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    // // Role-base access control authorization
    // { provide: APP_GUARD, useClass: RbacAuthGuard },
    {
      provide: APP_GUARD,
      useClass: PasswordSecurityGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PersistentLoggingInterceptor,
    },
  ],
})
export class AppModule { }
