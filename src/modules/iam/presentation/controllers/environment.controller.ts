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
import {
  CreateEnvironmentDto,
  CursorEnvironmentsQuery,
  PaginateEnvironmentsQuery,
  UpdateEnvironmentDto,
} from '../dtos/req/environment-request.dto';
import {
  EnvironmentResponseDto,
  CursorEnvironmentsResponseDto,
  PaginateEnvironmentsResponseDto,
} from '../dtos/res/environment-response.dto';
import { EnvironmentCommandHandler } from '@/modules/iam/application/services/environment/command.handler';
import { EnvironmentQueryHandler } from '@/modules/iam/application/services/environment/query.handler';
import { EnvironmentMapper } from '@/modules/iam/infrastructure/persistence/mappers/environment.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';

@ApiTags('environments')
@Controller(API_VERS.V1 + '/environments')
export class EnvironmentController {
  constructor(
    private readonly commandHandler: EnvironmentCommandHandler,
    private readonly queryHandler: EnvironmentQueryHandler,
  ) {}

  @Get('cursor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List environments with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Environments retrieved successfully',
    type: CursorEnvironmentsResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorEnvironmentsQuery,
  ): Promise<CursorEnvironmentsResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => EnvironmentMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @Get('slug/:slug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get environment by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, type: EnvironmentResponseDto })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<EnvironmentResponseDto> {
    const environment = await this.queryHandler.findBySlug(slug);
    if (!environment) {
      throw new Error('Environment not found');
    }
    return EnvironmentMapper.toResponseDto(environment);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get environment by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: EnvironmentResponseDto })
  async findById(@Param('id') id: string): Promise<EnvironmentResponseDto> {
    const environment = await this.queryHandler.findById(id);
    if (!environment) {
      throw new Error('Environment not found');
    }
    return EnvironmentMapper.toResponseDto(environment);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List environments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Environments retrieved successfully',
    type: PaginateEnvironmentsResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateEnvironmentsQuery,
  ): Promise<PaginateEnvironmentsResponseDto> {
    return await this.queryHandler.handlePaginate(listQuery);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new environment' })
  @ApiResponse({ status: 201, type: EnvironmentResponseDto })
  async create(
    @Body() dto: CreateEnvironmentDto,
  ): Promise<EnvironmentResponseDto> {
    const environment = await this.commandHandler.handleCreate(dto);
    return EnvironmentMapper.toResponseDto(environment);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an environment' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: EnvironmentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEnvironmentDto,
  ): Promise<EnvironmentResponseDto> {
    const environment = await this.commandHandler.handleUpdate({ id, ...dto });
    return EnvironmentMapper.toResponseDto(environment);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an environment' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDelete({ id });
  }
}
