import { Inject, Injectable } from '@nestjs/common';
import { LOG_REPO } from '@/modules/system/logs/domain/repositories/log.repository';
import { PrismaLogRepository } from '@/modules/system/logs/infrastructure/persistence/repositories/log.repository';
import { LogEntity } from '@/modules/system/logs/domain/entities/log.entity';

@Injectable()
export class LogQueryHandler {
  constructor(
    @Inject(LOG_REPO) private readonly logRepo: PrismaLogRepository,
  ) {}

  async findById(id: string): Promise<LogEntity | null> {
    return this.logRepo.findById(id);
  }

  async findMany(filters: any): Promise<LogEntity[]> {
    return this.logRepo.findMany(filters);
  }
}
