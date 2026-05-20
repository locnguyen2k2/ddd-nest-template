import { Inject, Injectable } from '@nestjs/common';
import { LOG_REPO } from '@/modules/system/logs/domain/repositories/log.repository';
import { PrismaLogRepository } from '@/modules/system/logs/infrastructure/persistence/repositories/log.repository';
import { LogEntity } from '@/modules/system/logs/domain/entities/log.entity';
import { CreateLogDto } from '../../dtos/create-log.dto';
import { uuidv7 } from 'uuidv7';
import { IEntityID } from '@/shared/domain/entities/base.entity';

@Injectable()
export class LogCmdHandler {
  constructor(
    @Inject(LOG_REPO) private readonly logRepo: PrismaLogRepository,
  ) {}

  async create(dto: CreateLogDto): Promise<void> {
    const _id = uuidv7();
    const id: IEntityID<string> = {
      value: _id,
      _id,
      get: () => _id,
    };

    const log = LogEntity.create({
      ...dto,
      id,
    });

    await this.logRepo.create(log);
  }
}
