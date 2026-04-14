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
  UpdateStaffAttributesArgs,
} from '@/modules/iam/application/dtos/commands/organization-cmd.dto';
import {
  GetOrganizationByIdQuery,
  GetOrganizationBySlugQuery,
} from '@/modules/iam/application/dtos/queries/organization-query.dto';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { API_VERS, HeaderKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IPayload } from '../../domain/services/auth.service';
import { User, HeaderKey } from '@/common/decorators';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { CheckAbac } from '../../../../common/decorators/check-abac.decorator';
import { AbacGuard } from '../guards/abac.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
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
    type: PaginateOrganizationsResponseDto,
  })
  @CheckAbac(PermissionAction.READ, 'Organization')
  @UseGuards(JwtAuthGuard, AbacGuard)
  async pagination(
    @Query() listQuery: PaginateOrganizationsQuery,
  ): Promise<PaginateOrganizationsResponseDto> {
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      data: result.data.map((organization) =>
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
  @CheckAbac('READ', 'Organization')
  @UseGuards(JwtAuthGuard, AbacGuard)
  async cursorPagination(
    @Query() listQuery: CursorOrganizationsQuery,
    @User() user: IPayload,
  ): Promise<CursorOrganizationsResponseDto> {
    listQuery.userId = user.sub;
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      data: result.data.map((organization) =>
        OrganizationMapper.toResponseDto(organization),
      ),
      paginated: result.paginated,
    };
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
  @CheckAbac('UPDATE', 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
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
  @UseGuards(JwtAuthGuard)
  async myOrganizations(@User() user: IPayload): Promise<OrgBaseResDto[]> {
    const organizations = await this.queryHandler.handleListOrganizationsByJoiner(user.sub);
    return organizations.map(OrganizationMapper.toResponseDto);
  }

  @Post()
  @ApiBearerAuth()
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
  @CheckAbac('CREATE', 'Organization')
  @UseGuards(JwtAuthGuard, AbacGuard)
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrgBaseResDto> {
    const command: CreateOrganizationArgs = createOrganizationDto;
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
  @ApiHeader({ name: HeaderKeys.ORG_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac('READ', 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getById(@Param('id') id: string): Promise<OrgBaseResDto> {
    const query: GetOrganizationByIdQuery = { id };
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
  @ApiHeader({ name: HeaderKeys.ORG_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac('READ', 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<OrgBaseResDto> {
    const query: GetOrganizationBySlugQuery = { slug };
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
  @ApiHeader({ name: HeaderKeys.ORG_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac('UPDATE', 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrgBaseResDto> {
    const command: UpdateOrganizationArgs = {
      id,
      ...updateOrganizationDto,
    };
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
  @ApiHeader({ name: HeaderKeys.ORG_ID, required: true })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac('DELETE', 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async delete(@Param('id') id: string): Promise<void> {
    const command: DeleteOrganizationArgs = { id };
    await this.commandHandler.handleDeleteOrganization(command);
  }

  @Patch('/:orgId/users/:userId/attributes')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a user's permissions/roles within the org" })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User attributes updated successfully',
  })
  @UseGuards(JwtAuthGuard, TenantContextGuard, AbacGuard)
  async updateUserAttributes(
    @Param('orgId') orgId: string,
    @Param('userId') userId: string,
    @Body() attributes: any,
  ): Promise<void> {
    const command: UpdateStaffAttributesArgs = {
      organizationId: orgId,
      userId,
      attributes,
    };
    await this.commandHandler.handleUpdateUserAttributes(command);
  }
}
