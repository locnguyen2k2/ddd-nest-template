import { LogEntity } from '../entities/log.entity';
import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';

export interface ILogRepository extends IPaginate<LogEntity>, ICursor<LogEntity> {
  create(log: LogEntity): Promise<void>;
  findById(id: string): Promise<LogEntity | null>;
  findMany(filters: any): Promise<LogEntity[]>;
}

export const ILogRepository = Symbol('ILogRepository');
export const LOG_REPO = 'LOG_REPO';

