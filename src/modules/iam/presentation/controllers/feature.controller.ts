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
import { CreateFeatureDto } from '@/modules/iam/presentation/dtos/req/feature.dto';
import { UpdateFeatureDto } from '@/modules/iam/presentation/dtos/req/feature.dto';
import { FeatureResponseDto, ListFeaturesResponseDto, PaginateFeaturesResponseDto, CursorFeaturesResponseDto } from '@/modules/iam/presentation/dtos/res/feature-response.dto';
import { FeatureCommandHandler } from '@/modules/iam/application/services/feature/feature.command.handler';
import { FeatureQueryHandler } from '@/modules/iam/application/services/feature/feature.query.handler';
import { CreateFeatureArgs, DeleteFeatureArgs, UpdateFeatureArgs } from '@/modules/iam/application/dtos/commands/feature-cmd.dto';
import { GetFeatureByIdQuery, GetFeatureBySlugQuery, ListFeaturesQuery, PaginateFeaturesQuery, CursorFeaturesQuery } from '@/modules/iam/application/dtos/queries/feature-query.dto';
import { FeatureMapper } from '@/modules/iam/infrastructure/persistence/mappers/feature.mapper';

@ApiTags('features')
@Controller('features')
export class FeatureController {
    constructor(
        private readonly commandHandler: FeatureCommandHandler,
        private readonly queryHandler: FeatureQueryHandler,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new feature' })
    @ApiResponse({ status: 201, description: 'Feature created successfully', type: FeatureResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Feature with slug already exists' })
    async create(@Body() createFeatureDto: CreateFeatureDto): Promise<FeatureResponseDto> {
        const command = new CreateFeatureArgs(createFeatureDto);
        const feature = await this.commandHandler.handleCreateFeature(command);
        return FeatureMapper.toResponseDto(feature);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get feature by ID' })
    @ApiParam({ name: 'id', description: 'Feature ID' })
    @ApiResponse({ status: 200, description: 'Feature found', type: FeatureResponseDto })
    @ApiResponse({ status: 404, description: 'Feature not found' })
    async getById(@Param('id') id: string): Promise<FeatureResponseDto> {
        const query = new GetFeatureByIdQuery({ id });
        const feature = await this.queryHandler.handleGetFeatureById(query);

        if (!feature) {
            throw new Error('Feature not found');
        }

        return FeatureMapper.toResponseDto(feature);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get feature by slug' })
    @ApiParam({ name: 'slug', description: 'Feature slug' })
    @ApiResponse({ status: 200, description: 'Feature found', type: FeatureResponseDto })
    @ApiResponse({ status: 404, description: 'Feature not found' })
    async getBySlug(@Param('slug') slug: string): Promise<FeatureResponseDto> {
        const query = new GetFeatureBySlugQuery({ slug });
        const feature = await this.queryHandler.handleGetFeatureBySlug(query);

        if (!feature) {
            throw new Error('Feature not found');
        }

        return FeatureMapper.toResponseDto(feature);
    }

    @Get()
    @ApiOperation({ summary: 'List features with pagination' })
    @ApiResponse({ status: 200, description: 'Features retrieved successfully', type: PaginateFeaturesResponseDto })
    async pagination(@Query() listQuery: PaginateFeaturesQuery): Promise<PaginateFeaturesResponseDto> {
        const result = await this.queryHandler.handlePaginate(listQuery);

        return {
            features: result.data.map(feature => FeatureMapper.toResponseDto(feature)),
            paginated: result.paginated,
        };
    }

    @Get('cursor')
    @ApiOperation({ summary: 'List features with cursor pagination' })
    @ApiResponse({ status: 200, description: 'Features retrieved successfully', type: CursorFeaturesResponseDto })
    async cursorPagination(@Query() listQuery: CursorFeaturesQuery): Promise<CursorFeaturesResponseDto> {
        const result = await this.queryHandler.handleCursorPaginate(listQuery);

        return {
            features: result.data.map(feature => FeatureMapper.toResponseDto(feature)),
            paginated: result.paginated,
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a feature' })
    @ApiParam({ name: 'id', description: 'Feature ID' })
    @ApiResponse({ status: 200, description: 'Feature updated successfully', type: FeatureResponseDto })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Feature not found' })
    @ApiResponse({ status: 409, description: 'Feature with slug already exists' })
    async update(
        @Param('id') id: string,
        @Body() updateFeatureDto: UpdateFeatureDto
    ): Promise<FeatureResponseDto> {
        const command = new UpdateFeatureArgs({ id, ...updateFeatureDto });
        const feature = await this.commandHandler.handleUpdateFeature(command);
        return FeatureMapper.toResponseDto(feature);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a feature' })
    @ApiParam({ name: 'id', description: 'Feature ID' })
    @ApiResponse({ status: 204, description: 'Feature deleted successfully' })
    @ApiResponse({ status: 404, description: 'Feature not found' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        const command = new DeleteFeatureArgs({ id });
        await this.commandHandler.handleDeleteFeature(command);
    }
}
