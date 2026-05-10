import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';
import { StaffQueryHandler } from '@/modules/iam/application/services/staffs/query.handler';

@ApiTags('staffs')
@Controller(API_VERS.V1 + '/staffs')
export class StaffController {
    constructor(
        private readonly queryHandler: StaffQueryHandler,
    ) { }
    @Get('growth/month/:orgId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get staffs growth by month' })
    @ApiParam({ name: 'orgId' })
    @ApiResponse({ status: 200, type: [Object] })
    async staffsGrowthByMonth(@Param('orgId') orgId: string): Promise<{ month: string; count: number }[]> {
        return await this.queryHandler.handleStaffsGrowthByMonth(orgId);
    }
}
