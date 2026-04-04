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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '@/modules/iam/presentation/dtos/req/project.dto';
import {
  ProjectResponseDto,
  PaginateProjectsResponseDto,
  CursorProjectsResponseDto,
} from '@/modules/iam/presentation/dtos/res/project-response.dto';
import { API_VERS } from '@/common/constant';
import { ProjectCmdHandler } from '../../application/services/project/project.cmd.handler';
import { ProjectQueryHandler } from '../../application/services/project/project.query.handler';
import {
  CursorProjectsQuery,
  GetProjectByIdQuery,
  GetProjectBySlugQuery,
  PaginateProjectsQuery,
} from '../../application/dtos/queries/project-query.dto';
import { ProjectMapper } from '../../infrastructure/persistence/mappers/project.mapper';

@ApiTags('projects')
@Controller(API_VERS.V1 + '/projects')
export class ProjectController {
  constructor(
    private readonly projectCmdHandler: ProjectCmdHandler,
    private readonly prjectQueryHandler: ProjectQueryHandler,
  ) { }

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Project with slug already exists' })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectCmdHandler.handleCreate(createProjectDto);
    return ProjectMapper.toResponseDto(ProjectMapper.toPrisma(project));
  }

  // READ - By ID
  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project found',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getById(@Param('id') id: string): Promise<ProjectResponseDto> {
    const query = new GetProjectByIdQuery({ id });
    const project = await this.prjectQueryHandler.handlerGetByID(query);

    if (!project) {
      throw new Error('Project not found');
    }

    return ProjectMapper.toResponseDto(ProjectMapper.toPrisma(project));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get project by slug' })
  @ApiParam({ name: 'slug', description: 'Project slug' })
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project found',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getBySlug(
    @Param('slug') slug: string,
    @Query('organization_id') organization_id: string,
  ): Promise<ProjectResponseDto> {
    const query = new GetProjectBySlugQuery({ slug, organization_id });
    const project = await this.prjectQueryHandler.handlerGetProjectBySlug(query);

    if (!project) {
      throw new Error('Project not found');
    }

    return ProjectMapper.toResponseDto(ProjectMapper.toPrisma(project));
  }

  @Get()
  @ApiOperation({ summary: 'List projects with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'organization_id',
    required: false,
    type: String,
    description: 'Filter by organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: PaginateProjectsResponseDto,
  })
  async paginate(
    @Query() listQuery: PaginateProjectsQuery,
  ): Promise<PaginateProjectsResponseDto> {
    const result = await this.prjectQueryHandler.handlePaginate(listQuery);

    return {
      projects: result.data,
      paginated: result.paginated,
    };
  }

  // READ - Cursor Pagination
  @Get('cursor')
  @ApiOperation({ summary: 'List projects with cursor pagination' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'organization_id',
    required: false,
    type: String,
    description: 'Filter by organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: CursorProjectsResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorProjectsQuery,
  ): Promise<CursorProjectsResponseDto> {
    const result = await this.prjectQueryHandler.handleCursorPaginate(listQuery);

    return {
      projects: result.data,
      paginated: result.paginated,
    };
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 409, description: 'Project with slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Query('organization_id') organization_id: string,
  ): Promise<ProjectResponseDto> {
    // TODO: Implement project update logic
    throw new Error('Not implemented yet');
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiQuery({
    name: 'organization_id',
    required: true,
    description: 'Organization ID',
  })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Query('organization_id') organization_id: string,
  ): Promise<void> {
    // TODO: Implement project delete logic
    throw new Error('Not implemented yet');
  }
}
