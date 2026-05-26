import { Controller, Get, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogQueryHandler } from '../../application/services/log/query.handler';
import { API_VERS } from '@/common/constant';

@ApiTags('system/logs')
@Controller(API_VERS.V1 + '/system/logs')
export class LogsController {
  constructor(private readonly logQueryHandler: LogQueryHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: any) {
    return await this.logQueryHandler.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log by id' })
  @ApiResponse({ status: 200, description: 'Log retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.logQueryHandler.findById(id);
  }
}
