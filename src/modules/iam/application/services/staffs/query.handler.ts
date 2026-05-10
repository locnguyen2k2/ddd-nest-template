

import { Inject, Injectable } from '@nestjs/common';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { IStaffRepository, STAFF_REPO } from '@/modules/iam/domain/repositories/staff.repository';

@Injectable()
export class StaffQueryHandler {
    constructor(
        @Inject(STAFF_REPO)
        private readonly staffRepo: IStaffRepository,
    ) { }

    @LogExecutionTime()
    async handleStaffsGrowthByMonth(orgId: string): Promise<{ month: string; count: number }[]> {
        return await this.staffRepo.staffsGrowthByMonthByOrgId(orgId);
    }
}