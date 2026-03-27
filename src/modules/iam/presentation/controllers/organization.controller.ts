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
import { CreateOrganizationDto } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { UpdateOrganizationDto } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { OrganizationResponseDto, ListOrganizationsResponseDto } from '@/modules/iam/presentation/dtos/res/organization-response.dto';
import { OrganizationCommandHandler } from '@/modules/iam/application/services/organization/command.handler';
import { OrganizationQueryHandler } from '@/modules/iam/application/services/organization/query.handler';
import { CreateOrganizationArgs, DeleteOrganizationArgs, UpdateOrganizationArgs } from '@/modules/iam/application/dtos/commands/organization-cmd.dto';
import { GetOrganizationByIdQuery, GetOrganizationBySlugQuery, ListOrganizationsQuery } from '@/modules/iam/application/dtos/queries/organization-query.dto';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { API_VERS } from '@/common/constant';

@ApiTags('organizations')
@Controller(API_VERS.V1 + '/organizations')
export class OrganizationController {
    constructor(
        private readonly commandHandler: OrganizationCommandHandler,
        private readonly queryHandler: OrganizationQueryHandler,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new organization' })
    @ApiResponse({ status: 201, description: 'Organization created successfully', type: OrganizationResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Organization with slug already exists' })
    async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
        const command = new CreateOrganizationArgs(createOrganizationDto);
        const organization = await this.commandHandler.handleCreateOrganization(command);
        return OrganizationMapper.toResponseDto(organization);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get organization by ID' })
    @ApiParam({ name: 'id', description: 'Organization ID' })
    @ApiResponse({ status: 200, description: 'Organization found', type: OrganizationResponseDto })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async getById(@Param('id') id: string): Promise<OrganizationResponseDto> {
        const query = new GetOrganizationByIdQuery({ id });
        const organization = await this.queryHandler.handleGetOrganizationById(query);

        if (!organization) {
            throw new Error('Organization not found');
        }

        return OrganizationMapper.toResponseDto(organization);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get organization by slug' })
    @ApiParam({ name: 'slug', description: 'Organization slug' })
    @ApiResponse({ status: 200, description: 'Organization found', type: OrganizationResponseDto })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    async getBySlug(@Param('slug') slug: string): Promise<OrganizationResponseDto> {
        const query = new GetOrganizationBySlugQuery({ slug });
        const organization = await this.queryHandler.handleGetOrganizationBySlug(query);

        if (!organization) {
            throw new Error('Organization not found');
        }

        return OrganizationMapper.toResponseDto(organization);
    }

    @Get()
    @ApiOperation({ summary: 'List organizations with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
    @ApiResponse({ status: 200, description: 'Organizations retrieved successfully', type: ListOrganizationsResponseDto })
    async list(@Query() listQuery: ListOrganizationsQuery): Promise<ListOrganizationsResponseDto> {
        const query = new ListOrganizationsQuery(listQuery);
        const result = await this.queryHandler.handleListOrganizations(query);

        return {
            organizations: result.organizations.map(org => OrganizationMapper.toResponseDto(org)),
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
    @ApiResponse({ status: 200, description: 'Organization updated successfully', type: OrganizationResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    @ApiResponse({ status: 409, description: 'Organization with slug already exists' })
    async update(
        @Param('id') id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto
    ): Promise<OrganizationResponseDto> {
        const command = new UpdateOrganizationArgs({ id, ...updateOrganizationDto });
        const organization = await this.commandHandler.handleUpdateOrganization(command);
        return OrganizationMapper.toResponseDto(organization);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an organization' })
    @ApiParam({ name: 'id', description: 'Organization ID' })
    @ApiResponse({ status: 204, description: 'Organization deleted successfully' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        const command = new DeleteOrganizationArgs({ id });
        await this.commandHandler.handleDeleteOrganization(command);
    }
}
