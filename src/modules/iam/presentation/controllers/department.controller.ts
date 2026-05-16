import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateDepartmentDto,
  CursorDepartmentsQuery,
  PaginateDepartmentsQuery,
  UpdateDepartmentDto,
} from '../dtos/req/department.dto';
import {
  CursorDepartmentsResponseDto,
  DepartmentResponseDto,
  PaginateDepartmentsResponseDto,
} from '../dtos/res/department-response.dto';
import { DepartmentCommandHandler } from '@/modules/iam/application/services/department/command.handler';
import { DepartmentQueryHandler } from '@/modules/iam/application/services/department/query.handler';
import { DepartmentMapper } from '@/modules/iam/infrastructure/persistence/mappers/department.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('departments')
@Controller(API_VERS.V1 + '/departments')
export class DepartmentController {
  constructor(
    private readonly commandHandler: DepartmentCommandHandler,
    private readonly queryHandler: DepartmentQueryHandler,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List departments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    type: PaginateDepartmentsResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateDepartmentsQuery,
  ): Promise<PaginateDepartmentsResponseDto> {
    return await this.queryHandler.handlePaginate(listQuery);
  }

  @Get('cursor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List departments with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    type: CursorDepartmentsResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorDepartmentsQuery,
  ): Promise<CursorDepartmentsResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => DepartmentMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto })
  async create(
    @Body() dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.commandHandler.handleCreateDepartment(dto);
    return DepartmentMapper.toResponseDto(department);
  }

  @Get('organization/:orgId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get departments by organization ID' })
  @ApiParam({ name: 'orgId' })
  @ApiResponse({ status: 200, type: [DepartmentResponseDto] })
  async findByOrgId(
    @Param('orgId') orgId: string,
  ): Promise<DepartmentResponseDto[]> {
    const departments = await this.queryHandler.handleGetDepartmentsByOrgId({
      organization_id: orgId,
    });
    return departments.map(DepartmentMapper.toResponseDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  async findById(@Param('id') id: string): Promise<DepartmentResponseDto> {
    const department = await this.queryHandler.handleGetDepartmentById({ id });
    if (!department) {
      throw new Error('Department not found');
    }
    return DepartmentMapper.toResponseDto(department);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a department' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.commandHandler.handleUpdateDepartment({
      id,
      ...dto,
    });
    return DepartmentMapper.toResponseDto(department);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a department' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDeleteDepartment({ id });
  }
}
