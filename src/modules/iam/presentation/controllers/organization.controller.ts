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
} from '@nestjs/swagger';
import { CreateOrganizationDto } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { UpdateOrganizationDto } from '@/modules/iam/presentation/dtos/req/organization.dto';
import {
  OrganizationResponseDto,
  ListOrganizationsResponseDto,
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
  ListOrganizationsQuery,
} from '@/modules/iam/application/dtos/queries/organization-query.dto';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { API_VERS, HeaderKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IPayload } from '../../domain/services/auth.service';
import { User, Permissions, HeaderKey, GetHeaderKey } from '@/common/decorators';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { AssignRoleToUserDto } from '../dtos/req/organization.dto';

@ApiTags('organizations')
@Controller(API_VERS.V1 + '/organizations')
export class OrganizationController {
  constructor(
    private readonly commandHandler: OrganizationCommandHandler,
    private readonly queryHandler: OrganizationQueryHandler,
  ) { }

  @Post('/assign-role')
  // @ApiBearerAuth()
  @ApiOperation({ summary: "Assign role to user" })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
  })
  @ApiHeaders([
    {
      name: HeaderKeys.ORG_ID,
      required: true,
      description: 'Organization ID',
    },
  ])
  @HeaderKey(HeaderKeys.ORG_ID)
  @ApiResponse({ status: 404, description: 'Role, organization or user not found' })
  @UseGuards(HeadersAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async joinOrganization(@User() user: IPayload, @Param('id') id: string): Promise<void> {
    await this.commandHandler.handleJoinOrganization({ userId: user.sub, organizationId: id });
  }

  @Get('/joined')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get organizations by user ID" })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: [OrganizationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Permissions(`organization:get`)
  @ApiHeaders([
    {
      name: HeaderKeys.ORG_ID,
      required: true,
    },
    {
      name: HeaderKeys.PROJECT_ID,
      required: true,
    }
  ])
  @HeaderKey(HeaderKeys.ORG_ID, HeaderKeys.PROJECT_ID)
  @UseGuards(HeadersAuthGuard, JwtAuthGuard)
  async myOrganizations(@User() user: IPayload): Promise<OrganizationResponseDto[]> {
    const organizations = await this.queryHandler.handleListOrganizationsByJoiner(user.sub);
    return organizations.map(OrganizationMapper.toResponseDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Organization with slug already exists',
  })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
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
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getById(@Param('id') id: string): Promise<OrganizationResponseDto> {
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
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<OrganizationResponseDto> {
    const query = new GetOrganizationBySlugQuery({ slug });
    const organization =
      await this.queryHandler.handleGetOrganizationBySlug(query);

    if (!organization) {
      throw new Error('Organization not found');
    }

    return OrganizationMapper.toResponseDto(organization);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: ListOrganizationsResponseDto,
  })
  async list(
    @Query() listQuery: ListOrganizationsQuery,
  ): Promise<ListOrganizationsResponseDto> {
    const result = await this.queryHandler.handleListOrganizations(listQuery);

    return {
      organizations: result.organizations.map((org) =>
        OrganizationMapper.toResponseDto(org),
      ),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    type: OrganizationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Organization with slug already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
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
  async delete(@Param('id') id: string): Promise<void> {
    const command = new DeleteOrganizationArgs({ id });
    await this.commandHandler.handleDeleteOrganization(command);
  }
}
