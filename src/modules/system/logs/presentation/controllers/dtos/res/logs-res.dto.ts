import { LogType, LogStatus, LogLevel, HttpMethod } from '@/modules/system/logs/domain/log.enum';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  created_at?: Date;

  @ApiProperty({ required: false })
  created_by?: string;

  @ApiProperty({ required: false })
  context?: string;

  @ApiProperty({ enum: LogType })
  type!: LogType;

  @ApiProperty({ enum: LogStatus })
  status!: LogStatus;

  @ApiProperty({ enum: LogLevel })
  level!: LogLevel;

  @ApiProperty()
  is_http!: boolean;

  @ApiProperty({ enum: HttpMethod, required: false })
  http_method?: HttpMethod;

  @ApiProperty({ required: false })
  path?: string;

  @ApiProperty({ required: false })
  status_code?: number;

  @ApiProperty({ required: false })
  request_id?: string;

  @ApiProperty({ required: false })
  trace_id?: string;

  @ApiProperty({ required: false })
  ip?: string;

  @ApiProperty({ required: false })
  user_agent?: string;

  @ApiProperty()
  action!: string;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  attributes?: any;

  @ApiProperty({ required: false })
  before?: any;

  @ApiProperty({ required: false })
  after?: any;

  @ApiProperty({ required: false })
  stack?: string;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty({ required: false })
  service?: string;
}

export class PaginateLogsResponseDto {
  @ApiProperty({ type: [LogResponseDto] })
  data!: LogResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorLogsResponseDto {
  @ApiProperty({ type: [LogResponseDto] })
  data!: LogResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
