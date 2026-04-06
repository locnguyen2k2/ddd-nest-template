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
  ApiHeaders,
  ApiHeader,
} from '@nestjs/swagger';
import { CreateOrganizationDto, CursorOrganizationsQuery, PaginateOrganizationsQuery } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { UpdateOrganizationDto } from '@/modules/iam/presentation/dtos/req/organization.dto';
import {
  CursorOrganizationsResponseDto,
  OrgBaseResDto,
  PaginateOrganizationsResponseDto,
} from '@/modules/iam/presentation/dtos/res/organization-response.dto';
import { OrganizationCommandHandler } from '@/modules/iam/application/services/organization/command.handler';
import { OrganizationQueryHandler } from '@/modules/iam/application/services/organization/query.handler';
import {
  CreateOrganizationArgs,
  DeleteOrganizationArgs,
  UpdateOrganizationArgs,
} from '@/modules/iam/application/dtos/commands/organization-cmd.dto';
import {
  GetOrganizationByIdQuery,
  GetOrganizationBySlugQuery,
} from '@/modules/iam/application/dtos/queries/organization-query.dto';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { API_VERS, HeaderKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IPayload } from '../../domain/services/auth.service';
import { User, Permissions, HeaderKey, GetHeaderKey } from '@/common/decorators';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { AssignRoleToUserDto } from '../dtos/req/organization.dto';
import { PermissionAction } from '@/common/enum';

const name = 'organizations'

@ApiTags(`${name}`)
@Controller(API_VERS.V1 + `/${name}`)
export class OrganizationController {
  constructor(
    private readonly commandHandler: OrganizationCommandHandler,
    private readonly queryHandler: OrganizationQueryHandler,
  ) { }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List organizations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: PaginateOrganizationsQuery,
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async pagination(
    @Query() listQuery: PaginateOrganizationsQuery,
  ): Promise<PaginateOrganizationsResponseDto> {
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      organizations: result.data.map((organization) =>
        OrganizationMapper.toResponseDto(organization),
      ),
      paginated: result.paginated,
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'List organizations with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: CursorOrganizationsResponseDto,
  })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async cursorPagination(
    @Query() listQuery: CursorOrganizationsQuery,
  ): Promise<CursorOrganizationsResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      organizations: result.data.map((organization) =>
        OrganizationMapper.toResponseDto(organization),
      ),
      paginated: result.paginated,
    };
  }

  @Delete('/unassign-role')
  // @ApiBearerAuth()
  @ApiOperation({ summary: "Unassign role from user" })
  @ApiResponse({
    status: 200,
    description: 'Role unassigned successfully',
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @ApiResponse({ status: 404, description: 'Role, organization or user not found' })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.UPDATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async unassignRoleFromUser(@Body() dto: AssignRoleToUserDto, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string): Promise<void> {
    await this.commandHandler.handleUnassignRoleFromUser({ ...dto });
  }

  @Post('/assign-role')
  // @ApiBearerAuth()
  @ApiOperation({ summary: "Assign role to user" })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @ApiResponse({ status: 404, description: 'Role, organization or user not found' })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.CREATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async assignRoleToUser(@Body() dto: AssignRoleToUserDto, @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string): Promise<void> {
    await this.commandHandler.handleAssignRoleToUser({ ...dto });
  }

  @Post('/:id/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Join organization" })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization joined successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.CREATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async joinOrganization(@User() user: IPayload, @Param('id') id: string): Promise<void> {
    await this.commandHandler.handleJoinOrganization({ userId: user.sub, organizationId: id });
  }

  @Get('/joined')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get organizations by user ID" })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: [OrgBaseResDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Permissions(`organization:read`)
  @ApiHeaders([
    {
      name: HeaderKeys.PROJECT_ID,
      required: true,
    }
  ])
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async myOrganizations(@User() user: IPayload): Promise<OrgBaseResDto[]> {
    const organizations = await this.queryHandler.handleListOrganizationsByJoiner(user.sub);
    return organizations.map(OrganizationMapper.toResponseDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrgBaseResDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Organization with slug already exists',
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.CREATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrgBaseResDto> {
    const command = new CreateOrganizationArgs(createOrganizationDto);
    const organization =
      await this.commandHandler.handleCreateOrganization(command);
    return OrganizationMapper.toResponseDto(organization);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization found',
    type: OrgBaseResDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async getById(@Param('id') id: string): Promise<OrgBaseResDto> {
    const query = new GetOrganizationByIdQuery({ id });
    const organization =
      await this.queryHandler.handleGetOrganizationById(query);

    if (!organization) {
      throw new Error('Organization not found');
    }

    return OrganizationMapper.toResponseDto(organization);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiParam({ name: 'slug', description: 'Organization slug' })
  @ApiResponse({
    status: 200,
    description: 'Organization found',
    type: OrgBaseResDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.READ}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<OrgBaseResDto> {
    const query = new GetOrganizationBySlugQuery({ slug });
    const organization =
      await this.queryHandler.handleGetOrganizationBySlug(query);

    if (!organization) {
      throw new Error('Organization not found');
    }

    return OrganizationMapper.toResponseDto(organization);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    type: OrgBaseResDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Organization with slug already exists',
  })
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.UPDATE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrgBaseResDto> {
    const command = new UpdateOrganizationArgs({
      id,
      ...updateOrganizationDto,
    });
    const organization =
      await this.commandHandler.handleUpdateOrganization(command);
    return OrganizationMapper.toResponseDto(organization);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 204,
    description: 'Organization deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({ name: HeaderKeys.PROJECT_ID, required: true })
  @HeaderKey(HeaderKeys.PROJECT_ID)
  @Permissions(`${name}:${PermissionAction.DELETE}`)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async delete(@Param('id') id: string): Promise<void> {
    const command = new DeleteOrganizationArgs({ id });
    await this.commandHandler.handleDeleteOrganization(command);
  }
}
