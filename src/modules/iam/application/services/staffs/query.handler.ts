

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
    async handleStaffsGrowthByOrgId(orgId: string, period?: string): Promise<{ date: string; count: number }[]> {
        return await this.staffRepo.staffGrowthByOrgId(orgId, period);
    }
}