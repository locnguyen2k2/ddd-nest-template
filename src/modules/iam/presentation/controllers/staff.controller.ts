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
import { API_VERS, HeaderKeys } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';
import { StaffQueryHandler } from '@/modules/iam/application/services/staffs/query.handler';
import { Period } from '@/common/enum';
import { GetHeaderKey, HeaderKey } from '@/common/decorators';
import { HeadersAuthGuard } from '@/modules/iam/presentation/guards/headers-auth.guard';

const name = 'staffs';

@ApiTags(name)
@Controller(API_VERS.V1 + `/${name}`)
export class StaffController {
    constructor(
        private readonly queryHandler: StaffQueryHandler,
    ) { }
    @Get('percent-growth')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get staff percent growth' })
    @ApiResponse({
        status: 200,
        description: 'Staff percent growth',
        type: Number,
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @HeaderKey(HeaderKeys.ORG_ID)
    @UseGuards(JwtAuthGuard, HeadersAuthGuard)
    async percentGrowth(@Query('period') period: string, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string) {
        return await this.queryHandler.percentGrowth(orgId, period);
    }


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
