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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateRoleDto,
  CursorRolesQuery,
  PaginateRolesQuery,
} from '@/modules/iam/presentation/dtos/req/role.dto';
import { UpdateRoleDto } from '@/modules/iam/presentation/dtos/req/role.dto';
import {
  RoleResponseDto,
  PaginateRolesResponseDto,
  CursorRolesResponseDto,
} from '@/modules/iam/presentation/dtos/res/role-response.dto';
import { RoleCommandHandler } from '@/modules/iam/application/services/role/command.handler';
import { RoleQueryHandler } from '@/modules/iam/application/services/role/query.handler';
import {
  CreateRoleArgs,
  DeleteRoleArgs,
  UpdateRoleArgs,
} from '@/modules/iam/application/dtos/commands/role-cmd.dto';
import { RoleMapper } from '@/modules/iam/infrastructure/persistence/mappers/role.mapper';
import { API_VERS, HeaderKeys, StorageKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetHeaderKey, HeaderKey, Permissions } from '@/common/decorators';
import { PermissionAction } from '@/common/enum';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { AbacGuard } from '../guards/abac.guard';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { CheckAbac } from '@/common/decorators/check-abac.decorator';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import {
  GetRoleByIdQuery,
  GetRoleBySlugQuery,
} from '../../application/dtos/queries/role-query.dto';

const name = 'roles';

@ApiTags(name)
@Controller(API_VERS.V1 + `/${name}`)
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class RoleController {
  constructor(
    private readonly commandHandler: RoleCommandHandler,
    private readonly queryHandler: RoleQueryHandler,
    private readonly cls: ClsService<MyClsStore>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Role with slug already exists' })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.CREATE, 'Role')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: CreateRoleArgs = {
      ...createRoleDto,
      organization_id: orgId,
    };
    const role = await this.commandHandler.handleCreateRole(command);
    return RoleMapper.toResponseDto(role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'Role')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getById(@Param('id') id: string): Promise<RoleResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetRoleByIdQuery = { id, organization_id: orgId };
    const role = await this.queryHandler.handleGetRoleById(query);

    if (!role) {
      throw new Error('Role not found');
    }

    return RoleMapper.toResponseDto(role);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get role by slug' })
  @ApiParam({ name: 'slug', description: 'Role slug' })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'Role')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getBySlug(@Param('slug') slug: string): Promise<RoleResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetRoleBySlugQuery = { slug, organization_id: orgId };
    const role = await this.queryHandler.handleGetRoleBySlug(query);

    if (!role) {
      throw new Error('Role not found');
    }

    return RoleMapper.toResponseDto(role);
  }

  @Get()
  @ApiOperation({ summary: 'List roles with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: PaginateRolesResponseDto,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async pagination(
    @Query() listQuery: PaginateRolesQuery,
    @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string,
  ): Promise<PaginateRolesResponseDto> {
    listQuery.organization_id = orgId;
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      data: result.data.map((role) => RoleMapper.toResponseDto(role)),
      paginated: result.paginated,
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'List roles with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: CursorRolesResponseDto,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async cursorPagination(
    @Query() listQuery: CursorRolesQuery,
    @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string,
  ): Promise<CursorRolesResponseDto> {
    listQuery.organization_id = orgId;
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      data: result.data.map((role) => RoleMapper.toResponseDto(role)),
      paginated: result.paginated,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role with slug already exists' })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.UPDATE, 'Role')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: UpdateRoleArgs = {
      id,
      ...updateRoleDto,
      organization_id: orgId,
    };
    const role = await this.commandHandler.handleUpdateRole(command);
    return RoleMapper.toResponseDto(role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.DELETE, 'Role')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async delete(@Param('id') id: string): Promise<void> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: DeleteRoleArgs = {
      id,
      organization_id: orgId,
    };
    await this.commandHandler.handleDeleteRole(command);
  }
}
