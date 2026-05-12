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
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  PaginateProjectsQuery,
  UpdateProjectDto,
  CursorProjectsQuery,
} from '@/modules/iam/presentation/dtos/req/project.dto';
import {
  ProjectResponseDto,
  PaginateProjectsResponseDto,
  CursorProjectsResponseDto,
} from '@/modules/iam/presentation/dtos/res/project-response.dto';
import { API_VERS, HeaderKeys, StorageKeys } from '@/common/constant';
import { ProjectCmdHandler } from '../../application/services/project/cmd.handler';
import { ProjectQueryHandler } from '../../application/services/project/query.handler';
import {
  GetProjectByIdQuery,
  GetProjectBySlugQuery,
} from '../../application/dtos/queries/project-query.dto';
import { ProjectMapper } from '../../infrastructure/persistence/mappers/project.mapper';
import { PermissionAction } from '@/common/enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { AbacGuard } from '../guards/abac.guard';
import { CheckAbac } from '../../../../common/decorators/check-abac.decorator';
import { GetHeaderKey, HeaderKey, User } from '@/common/decorators'
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { CreateProjectArgs, UpdateProjectArgs, DeleteProjectArgs } from '../../application/dtos/commands/project-cmd.dto';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { IPayload } from '../../domain/services/auth.service';

const name = 'projects';

@ApiTags(name)
@Controller(API_VERS.V1 + `/${name}`)
export class ProjectController {
  constructor(
    private readonly projectCmdHandler: ProjectCmdHandler,
    private readonly prjectQueryHandler: ProjectQueryHandler,
    private readonly cls: ClsService<MyClsStore>,
  ) { }

  @Get('percent-growth')
  @ApiOperation({ summary: 'Get project percent growth' })
  @ApiResponse({
    status: 200,
    description: 'Project percent growth',
    type: Number,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async percentGrowth(@Query('period') period: string, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string) {
    return await this.prjectQueryHandler.percentGrowth(orgId, period);
  }

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
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.CREATE, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async create(@Body() createProjectDto: CreateProjectDto, @User() user: IPayload): Promise<ProjectResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: CreateProjectArgs = {
      ...createProjectDto,
      organization_id: orgId,
    };
    const project = await this.projectCmdHandler.handleCreate(user, command);
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
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getById(@Param('id') id: string): Promise<ProjectResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetProjectByIdQuery = { id, organization_id: orgId };
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
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<ProjectResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetProjectBySlugQuery = { slug, organization_id: orgId };
    const project = await this.prjectQueryHandler.handlerGetProjectBySlug(query);

    if (!project) {
      throw new Error('Project not found');
    }

    return ProjectMapper.toResponseDto(ProjectMapper.toPrisma(project));
  }

  @Get()
  @ApiOperation({ summary: 'List projects with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: PaginateProjectsResponseDto,
  })
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async paginate(
    @Query() listQuery: PaginateProjectsQuery,
  ): Promise<PaginateProjectsResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: PaginateProjectsQuery = {
      ...listQuery,
      organization_id: orgId,
      skip: listQuery.skip,
    };
    const result = await this.prjectQueryHandler.handlePaginate(query);

    return {
      data: result.data,
      paginated: result.paginated,
    };
  }

  // READ - Cursor Pagination
  @Get('cursor')
  @ApiOperation({ summary: 'List projects with cursor pagination' })
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  // @CheckAbac(PermissionAction.READ, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard)
  async cursorPagination(
    @Query() listQuery: CursorProjectsQuery,
  ): Promise<CursorProjectsResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: CursorProjectsQuery = {
      ...listQuery,
      organization_id: orgId,
    };
    const result = await this.prjectQueryHandler.handleCursorPaginate(query);

    return {
      data: result.data,
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
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @CheckAbac(PermissionAction.UPDATE, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: UpdateProjectArgs = {
      ...updateProjectDto,
      organization_id: orgId,
    };
    const project = await this.projectCmdHandler.handleUpdate(id, command);
    return ProjectMapper.toResponseDto(ProjectMapper.toPrisma(project));
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({
    name: HeaderKeys.ORG_ID,
    required: true,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.DELETE, 'project')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async delete(
    @Param('id') id: string,
  ): Promise<void> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: DeleteProjectArgs = {
      id,
      organization_id: orgId,
    };
    await this.projectCmdHandler.handleDelete(command);
  }
}
