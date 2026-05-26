import { Injectable } from '@nestjs/common';
import { ILogRepository } from '@/modules/system/logs/domain/repositories/log.repository';
import { LogEntity } from '@/modules/system/logs/domain/entities/log.entity';
import { LogMapper } from '../mappers/log.mapper';
import { MongodbAdapter } from '@/shared/infrastructure/adapters/mongodb.adapter';

@Injectable()
export class PrismaLogRepository implements ILogRepository {
  constructor(private readonly mongodb: MongodbAdapter) { }

  async create(log: LogEntity): Promise<void> {
    try {
      const data = LogMapper.toPrisma(log);
      await this.mongodb.logs.create({ data });
    } catch (e: any) {
      console.log(e?.message);
    }
  }

  async findById(id: string): Promise<LogEntity | null> {
    const log = await this.mongodb.logs.findUnique({
      where: { id },
    });

    if (!log) return null;

    return LogMapper.toDomain(log);
  }

  async findMany(filters: any): Promise<LogEntity[]> {
    const logs = await this.mongodb.logs.findMany({
      where: filters,
      orderBy: { created_at: 'desc' },
    });

    return logs.map((log) => LogMapper.toDomain(log));
  }
}
