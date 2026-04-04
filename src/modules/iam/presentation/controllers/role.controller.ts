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
import { AssignPermissionToRoleArgs, CreateRoleDto } from '@/modules/iam/presentation/dtos/req/role.dto';
import { UpdateRoleDto } from '@/modules/iam/presentation/dtos/req/role.dto';
import {
  RoleResponseDto,
  PaginateRolesResponseDto,
  CursorRolesResponseDto,
} from '@/modules/iam/presentation/dtos/res/role-response.dto';
import { RoleCommandHandler } from '@/modules/iam/application/services/role/role.command.handler';
import { RoleQueryHandler } from '@/modules/iam/application/services/role/role.query.handler';
import {
  CreateRoleArgs,
  DeleteRoleArgs,
  UpdateRoleArgs,
} from '@/modules/iam/application/dtos/commands/role-cmd.dto';
import {
  CursorRolesQuery,
  GetRoleByIdQuery,
  GetRoleBySlugQuery,
  PaginateRolesQuery,
} from '@/modules/iam/application/dtos/queries/role-query.dto';
import { RoleMapper } from '@/modules/iam/infrastructure/persistence/mappers/role.mapper';
import { API_VERS } from '@/common/constant';

@ApiTags('roles')
@Controller(API_VERS.V1 + '/roles')
export class RoleController {
  constructor(
    private readonly commandHandler: RoleCommandHandler,
    private readonly queryHandler: RoleQueryHandler,
  ) { }

  @Post('assign-permission')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({
    status: 200,
    description: 'Permission assigned to role successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  async assignPermissionToRole(@Body() assignPermissionToRoleDto: AssignPermissionToRoleArgs): Promise<void> {
    await this.commandHandler.handleAssignPermissionToRole(assignPermissionToRoleDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Role with slug already exists' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.commandHandler.handleCreateRole(createRoleDto);
    return RoleMapper.toResponseDto(RoleMapper.toPrisma(role));
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
  async getById(@Param('id') id: string): Promise<RoleResponseDto> {
    const role = await this.queryHandler.handleGetRolePermissions(id);

    if (!role) {
      throw new Error('Role not found');
    }

    return RoleMapper.toResponseDtoWithPermissions(RoleMapper.toPrismaWithPermissions(role));
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
  async getBySlug(@Param('slug') slug: string): Promise<RoleResponseDto> {
    const query = new GetRoleBySlugQuery({ slug });
    const role = await this.queryHandler.handleGetRoleBySlug(query);

    if (!role) {
      throw new Error('Role not found');
    }

    return RoleMapper.toResponseDto(RoleMapper.toPrisma(role));
  }

  @Get()
  @ApiOperation({ summary: 'List roles with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: PaginateRolesResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateRolesQuery,
  ): Promise<PaginateRolesResponseDto> {
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      roles: result.data,
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
  async cursorPagination(
    @Query() listQuery: CursorRolesQuery,
  ): Promise<CursorRolesResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      roles: result.data,
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
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const command = new UpdateRoleArgs({ id, ...updateRoleDto });
    const role = await this.commandHandler.handleUpdateRole(command);
    return RoleMapper.toResponseDto(RoleMapper.toPrisma(role));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    const command = new DeleteRoleArgs({ id });
    await this.commandHandler.handleDeleteRole(command);
  }
}
