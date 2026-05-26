import { Module } from '@nestjs/common';
import { LogsController } from './presentation/controllers/logs.controller';
import { LogCmdHandler } from './application/services/log/command.handler';
import { LogQueryHandler } from './application/services/log/query.handler';
import { PrismaLogRepository } from './infrastructure/persistence/repositories/log.repository';
import { LOG_REPO } from './domain/repositories/log.repository';
import { PersistentLoggingInterceptor } from './presentation/interceptors/persistent-logging.interceptor';

@Module({
  controllers: [LogsController],
  providers: [
    LogCmdHandler,
    LogQueryHandler,
    PrismaLogRepository,
    PersistentLoggingInterceptor,
    {
      provide: LOG_REPO,
      useClass: PrismaLogRepository,
    },
  ],
  exports: [LogCmdHandler, LogQueryHandler, PersistentLoggingInterceptor],
})
export class LogsModule {}
