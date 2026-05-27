import { Controller, Get, Param, Query, HttpStatus, HttpCode, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeaders } from '@nestjs/swagger';
import { LogQueryHandler } from '../../application/services/log/query.handler';
import { API_VERS, HeaderKeys } from '@/common/constant';
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
import { HeadersAuthGuard } from '@/modules/iam/presentation/guards/headers-auth.guard';
import { GetHeaderKey, HeaderKey, } from '@/common/decorators';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';
import { AbacGuard } from '@/modules/iam/presentation/guards/abac.guard';
import { CheckAbac } from '@/common/decorators/check-abac.decorator';
import { PermissionAction } from '@/common/enum';

const name = 'Logs';
@ApiTags(`system/${name.toLowerCase()}`)
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
  @ApiHeaders([
    {
      name: 'organization-id',
      description: 'Organization ID for scoping the logs',
      required: false,
    }
  ])
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.UPDATE, 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  @HttpCode(HttpStatus.OK)
  async pagination(@Query() query: PaginateLogsQuery, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string): Promise<PaginateLogsResponseDto> {
    query.org_id = orgId;
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
  @ApiHeaders([
    {
      name: 'organization-id',
      description: 'Organization ID for scoping the logs',
      required: false,
    }
  ])
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.UPDATE, 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  @HttpCode(HttpStatus.OK)
  async cursorPagination(@Query() query: CursorLogsQuery, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string): Promise<CursorLogsResponseDto> {
    query.org_id = orgId;
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
