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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateRoleDto } from '@/modules/iam/presentation/dtos/req/role.dto';
import { UpdateRoleDto } from '@/modules/iam/presentation/dtos/req/role.dto';
import { RoleResponseDto, ListRolesResponseDto } from '@/modules/iam/presentation/dtos/res/role-response.dto';
import { RoleCommandHandler } from '@/modules/iam/application/services/role/role.command.handler';
import { RoleQueryHandler } from '@/modules/iam/application/services/role/role.query.handler';
import { CreateRoleArgs, DeleteRoleArgs, UpdateRoleArgs } from '@/modules/iam/application/dtos/commands/role-cmd.dto';
import { GetRoleByIdQuery, GetRoleBySlugQuery, ListRolesQuery } from '@/modules/iam/application/dtos/queries/role-query.dto';
import { RoleMapper } from '@/modules/iam/infrastructure/persistence/mappers/role.mapper';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
    constructor(
        private readonly commandHandler: RoleCommandHandler,
        private readonly queryHandler: RoleQueryHandler,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Role with slug already exists' })
    async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
        const command = new CreateRoleArgs(createRoleDto);
        const role = await this.commandHandler.handleCreateRole(command);
        return RoleMapper.toResponseDto(role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get role by ID' })
    @ApiParam({ name: 'id', description: 'Role ID' })
    @ApiResponse({ status: 200, description: 'Role found', type: RoleResponseDto })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async getById(@Param('id') id: string): Promise<RoleResponseDto> {
        const query = new GetRoleByIdQuery({ id });
        const role = await this.queryHandler.handleGetRoleById(query);

        if (!role) {
            throw new Error('Role not found');
        }

        return RoleMapper.toResponseDto(role);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get role by slug' })
    @ApiParam({ name: 'slug', description: 'Role slug' })
    @ApiResponse({ status: 200, description: 'Role found', type: RoleResponseDto })
    @ApiResponse({ status: 404, description: 'Role not found' })
    async getBySlug(@Param('slug') slug: string): Promise<RoleResponseDto> {
        const query = new GetRoleBySlugQuery({ slug });
        const role = await this.queryHandler.handleGetRoleBySlug(query);

        if (!role) {
            throw new Error('Role not found');
        }

        return RoleMapper.toResponseDto(role);
    }

    @Get()
    @ApiOperation({ summary: 'List roles with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
    @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: ListRolesResponseDto })
    async list(@Query() listQuery: ListRolesQuery): Promise<ListRolesResponseDto> {
        const query = new ListRolesQuery(listQuery);
        const result = await this.queryHandler.handleListRoles(query);

        return {
            roles: result.roles.map(role => RoleMapper.toResponseDto(role)),
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a role' })
    @ApiParam({ name: 'id', description: 'Role ID' })
    @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Role not found' })
    @ApiResponse({ status: 409, description: 'Role with slug already exists' })
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto
    ): Promise<RoleResponseDto> {
        const command = new UpdateRoleArgs({ id, ...updateRoleDto });
        const role = await this.commandHandler.handleUpdateRole(command);
        return RoleMapper.toResponseDto(role);
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
