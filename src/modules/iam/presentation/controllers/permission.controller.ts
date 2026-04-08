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
  ApiHeader,
} from '@nestjs/swagger';
import { CreatePermissionDto, UpdatePermissionDto } from '@/modules/iam/presentation/dtos/req/permission.dto';
import {
  PermissionResponseDto,
  PaginatePermissionResponseDto,
  CursorPermissionResponseDto,
} from '@/modules/iam/presentation/dtos/res/permission-response.dto';
import { PermissionCmdHandler } from '@/modules/iam/application/services/permission/permission.cmd.handler';
import { PermissionQueryHandler } from '@/modules/iam/application/services/permission/permission.query.handler';
import {
  CreatePermissionArgs,
  DeletePermissionArgs,
  UpdatePermissionArgs,
} from '@/modules/iam/application/dtos/commands/permission-cmd.dto';
import {
  CursorPermissionQuery,
  GetPermissionByIdQuery,
  PaginatePermissionQuery,
} from '@/modules/iam/application/dtos/queries/permission-query.dto';
import { PermissionMapper } from '@/modules/iam/infrastructure/persistence/mappers/permission.mapper';
import { API_VERS, HeaderKeys } from '@/common/constant';
import { HeaderKey } from '@/common/decorators';
import { PermissionAction } from '@/common/enum';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Permissions } from '@/common/decorators'

const name = 'permissions';

@ApiTags(name)
@Controller(API_VERS.V1 + `/${name}`)
export class PermissionController {
  constructor(
    private readonly commandHandler: PermissionCmdHandler,
    private readonly queryHandler: PermissionQueryHandler,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Permission with action already exists' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.CREATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const command = new CreatePermissionArgs(createPermissionDto);
    const permission = await this.commandHandler.handleCreatePermission(command);
    return PermissionMapper.toResponseDto(permission);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission found',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async getById(@Param('id') id: string): Promise<PermissionResponseDto> {
    const query = new GetPermissionByIdQuery({ id });
    const permission = await this.queryHandler.handleGetById(query);

    if (!permission) {
      throw new Error('Permission not found');
    }

    return PermissionMapper.toResponseDto(permission);
  }

  @Get()
  @ApiOperation({ summary: 'List permissions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: PaginatePermissionResponseDto,
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async pagination(
    @Query() listQuery: PaginatePermissionQuery,
  ): Promise<PaginatePermissionResponseDto> {
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      data: result.data,
      paginated: result.paginated,
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'List permissions with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: CursorPermissionResponseDto,
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async cursorPagination(
    @Query() listQuery: CursorPermissionQuery,
  ): Promise<CursorPermissionResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      data: result.data.map((permission: any) => PermissionMapper.toResponseDto(permission)),
      paginated: result.paginated,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 409, description: 'Permission with action already exists' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.UPDATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const command = new UpdatePermissionArgs({ id, ...updatePermissionDto } as any);
    const permission = await this.commandHandler.handleUpdatePermission(command);
    return PermissionMapper.toResponseDto(permission);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.DELETE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async delete(@Param('id') id: string): Promise<void> {
    const command = new DeletePermissionArgs({ id });
    await this.commandHandler.handleDeletePermission(command);
  }
}
