import {
    IPaginate,
    ICursor,
} from '@/shared/domain/repositories/base.repository';
import { Staffs } from '../entities/staffs.entity';
import { StatsGrowInfo } from '@/common/interfaces/stats.interface';

export const STAFF_REPO = Symbol('STAFF_REPO');
export interface IStaffRepository
    extends IPaginate<Staffs>, ICursor<Staffs> {
    findOneById(id: string): Promise<Staffs | null>;
    findOneUser(userId: string, orgId: string): Promise<Staffs | null>;
    findByUserId(userId: string): Promise<Staffs[]>;
    findByUserIdAndOrgId(userId: string, orgId: string): Promise<Staffs | null>;
    findByOrgId(orgId: string): Promise<Staffs[]>;
    create(data: Staffs): Promise<Staffs>;
    update(id: string, data: Staffs): Promise<Staffs>;
    delete(id: string): Promise<void>;

    orgStaffGrowthByMonth(orgId: string): Promise<StatsGrowInfo>
    orgStaffGrowthByYear(orgId: string): Promise<StatsGrowInfo>
    orgStaffGrowthByWeek(orgId: string): Promise<StatsGrowInfo>
    orgStaffGrowthByDay(orgId: string): Promise<StatsGrowInfo>

    countBeforeByMonth(org_id: string): Promise<number>
    countByMonth(org_id: string): Promise<number>
}
