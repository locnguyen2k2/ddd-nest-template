

import { Inject, Injectable } from '@nestjs/common';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { IStaffRepository, STAFF_REPO } from '@/modules/iam/domain/repositories/staff.repository';
import { Period } from '@/common/enum';
import { StatsPercentInfo } from '@/common/interfaces/stats.interface';

@Injectable()
export class StaffQueryHandler {
    constructor(
        @Inject(STAFF_REPO)
        private readonly staffRepo: IStaffRepository,
    ) { }

    private readonly staffGrowth = {
        [Period.WEEK]: async (orgId: string) => this.staffRepo.orgStaffGrowthByWeek(orgId),
        [Period.MONTH]: async (orgId: string) => this.staffRepo.orgStaffGrowthByMonth(orgId),
        [Period.DAY]: async (orgId: string) => this.staffRepo.orgStaffGrowthByDay(orgId),
        [Period.YEAR]: async (orgId: string) => this.staffRepo.orgStaffGrowthByYear(orgId),
    };

    private readonly percentGrowthCalc = {
        [Period.MONTH]: async (orgId: string) => this.percentByMonth(orgId),
    };

    async staffGrowthByOrgId(orgId: string, period?: string) {
        return await this.staffGrowth[period || Period.MONTH](orgId);
    }

    async percentGrowth(orgId: string, period?: string): Promise<StatsPercentInfo> {
        return await this.percentGrowthCalc[period || Period.MONTH](orgId);
    }

    async percentByMonth(orgId: string): Promise<StatsPercentInfo> {
        let result: StatsPercentInfo = {
            percent_growth: 0,
            total: 0,
            current: 0,
            title: '',
        }
        try {
            const [beforeCount, currentCount] = await Promise.all([
                this.staffRepo.countBeforeByMonth(orgId),
                this.staffRepo.countByMonth(orgId),
            ]);
            if (beforeCount === 0) {
                result.percent_growth = 100;
            } else {
                result.percent_growth = (currentCount - beforeCount) / beforeCount;
            }
            result.total = currentCount + beforeCount;
            result.current = currentCount;
            return result;
        } catch (error) {
            console.error(error);
            return result;
        }
    }

    @LogExecutionTime()
    async handleStaffsGrowthByOrgId(orgId: string, period?: string): Promise<{ date: string; count: number }[]> {
        return await this.staffGrowthByOrgId(orgId, period);
    }
}