import {
    Controller,
    Get,
    Param,
    Query,
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
import { Period } from '@/common/enum';

@ApiTags('staffs')
@Controller(API_VERS.V1 + '/staffs')
export class StaffController {
    constructor(
        private readonly queryHandler: StaffQueryHandler,
    ) { }
    @Get('growth/:orgId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get staffs growth by orgId' })
    @ApiParam({ name: 'orgId', description: 'Organization ID' })
    @ApiResponse({ status: 200, type: [Object] })
    async staffsGrowthByOrgId(@Param('orgId') orgId: string, @Query('period') period?: Period): Promise<{ date: string; count: number }[]> {
        return await this.queryHandler.handleStaffsGrowthByOrgId(orgId, period);
    }
}
