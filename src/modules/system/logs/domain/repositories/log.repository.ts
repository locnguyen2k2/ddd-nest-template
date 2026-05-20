import { LogEntity } from '../entities/log.entity';

export interface ILogRepository {
  create(log: LogEntity): Promise<void>;
  findById(id: string): Promise<LogEntity | null>;
  findMany(filters: any): Promise<LogEntity[]>;
}

export const ILogRepository = Symbol('ILogRepository');
export const LOG_REPO = 'LOG_REPO';

