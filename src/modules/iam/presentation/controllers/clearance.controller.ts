import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateClearanceDto, CursorClearancesQuery, PaginateClearancesQuery, UpdateClearanceDto } from '../dtos/req/clearance-request.dto';
import { ClearanceResponseDto, CursorClearancesResponseDto, PaginateClearancesResponseDto } from '../dtos/res/clearance-response.dto';
import { ClearanceCommandHandler } from '@/modules/iam/application/services/clearance/command.handler';
import { ClearanceQueryHandler } from '@/modules/iam/application/services/clearance/query.handler';
import { ClearanceMapper } from '@/modules/iam/infrastructure/persistence/mappers/clearance.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';

@ApiTags('clearances')
@Controller(API_VERS.V1 + '/clearances')
export class ClearanceController {
  constructor(
    private readonly commandHandler: ClearanceCommandHandler,
    private readonly queryHandler: ClearanceQueryHandler,
  ) { }

  @Get('cursor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List clearances with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Clearances retrieved successfully',
    type: CursorClearancesResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorClearancesQuery,
  ): Promise<CursorClearancesResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => ClearanceMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @Get('level/:level')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clearance by level' })
  @ApiParam({ name: 'level' })
  @ApiResponse({ status: 200, type: ClearanceResponseDto })
  async findByLevel(@Param('level') level: number): Promise<ClearanceResponseDto> {
    const clearance = await this.queryHandler.findByLevel(level);
    if (!clearance) {
      throw new Error('Clearance not found');
    }
    return ClearanceMapper.toResponseDto(clearance);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clearance by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: ClearanceResponseDto })
  async findById(@Param('id') id: string): Promise<ClearanceResponseDto> {
    const clearance = await this.queryHandler.findById(id);
    if (!clearance) {
      throw new Error('Clearance not found');
    }
    return ClearanceMapper.toResponseDto(clearance);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List clearances with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Clearances retrieved successfully',
    type: PaginateClearancesResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateClearancesQuery,
  ): Promise<PaginateClearancesResponseDto> {
    return await this.queryHandler.handlePaginate(listQuery);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new clearance' })
  @ApiResponse({ status: 201, type: ClearanceResponseDto })
  async create(@Body() dto: CreateClearanceDto): Promise<ClearanceResponseDto> {
    const clearance = await this.commandHandler.handleCreate(dto);
    return ClearanceMapper.toResponseDto(clearance);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a clearance' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: ClearanceResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClearanceDto,
  ): Promise<ClearanceResponseDto> {
    const clearance = await this.commandHandler.handleUpdate({ id, ...dto });
    return ClearanceMapper.toResponseDto(clearance);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a clearance' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDelete({ id });
  }
}
