import { Controller, Get, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogQueryHandler } from '../../application/services/log/query.handler';
import { API_VERS } from '@/common/constant';
import {
  PaginateLogsQuery,
  CursorLogsQuery,
} from './dtos/req/logs-req.dto';
import {
  LogResponseDto,
  PaginateLogsResponseDto,
  CursorLogsResponseDto,
} from './dtos/res/logs-res.dto';
import { LogMapper } from '../../infrastructure/persistence/mappers/log.mapper';

@ApiTags('system/logs')
@Controller(API_VERS.V1 + '/system/logs')
export class LogsController {
  constructor(private readonly logQueryHandler: LogQueryHandler) { }

  @Get()
  @ApiOperation({ summary: 'List logs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
    type: PaginateLogsResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async pagination(@Query() query: PaginateLogsQuery): Promise<PaginateLogsResponseDto> {
    const result = await this.logQueryHandler.handlePaginate(query);
    return {
      data: result.data.map((log) => LogMapper.toResponseDto(log)),
      paginated: result.paginated,
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'List logs with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
    type: CursorLogsResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async cursorPagination(@Query() query: CursorLogsQuery): Promise<CursorLogsResponseDto> {
    const result = await this.logQueryHandler.handleCursorPaginate(query);
    return {
      data: result.data.map((log) => LogMapper.toResponseDto(log)),
      paginated: result.paginated,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get log by id' })
  @ApiResponse({
    status: 200,
    description: 'Log retrieved successfully',
    type: LogResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<LogResponseDto> {
    const log = await this.logQueryHandler.findById(id);
    if (!log) {
      throw new Error('Log not found');
    }
    return LogMapper.toResponseDto(log);
  }
}
