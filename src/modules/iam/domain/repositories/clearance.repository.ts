import { IPaginate, ICursor } from '@/shared/domain/repositories/base.repository';
import { ClearanceEntity } from '../entities/clearance.entity';

export const CLEARANCE_REPO = 'CLEARANCE_REPOSITORY';

export interface IClearanceRepository extends IPaginate<ClearanceEntity>, ICursor<ClearanceEntity> {
    create(clearance: ClearanceEntity): Promise<ClearanceEntity>;
    update(clearance: ClearanceEntity): Promise<ClearanceEntity>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<ClearanceEntity | null>;
    findByLevel(level: number): Promise<ClearanceEntity | null>;
    findAll(): Promise<ClearanceEntity[]>;
}
