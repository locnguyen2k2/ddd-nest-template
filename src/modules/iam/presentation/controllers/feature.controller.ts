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
} from '@nestjs/swagger';
import { CreateFeatureDto, CursorFeaturesQuery, PaginateFeaturesQuery } from '@/modules/iam/presentation/dtos/req/feature.dto';
import { UpdateFeatureDto } from '@/modules/iam/presentation/dtos/req/feature.dto';
import {
  FeatureResponseDto,
  PaginateFeaturesResponseDto,
  CursorFeaturesResponseDto,
} from '@/modules/iam/presentation/dtos/res/feature-response.dto';
import { FeatureCommandHandler } from '@/modules/iam/application/services/feature/command.handler';
import { FeatureQueryHandler } from '@/modules/iam/application/services/feature/query.handler';
import {
  CreateFeatureArgs,
  DeleteFeatureArgs,
  UpdateFeatureArgs,
} from '@/modules/iam/application/dtos/commands/feature-cmd.dto';
import { FeatureMapper } from '@/modules/iam/infrastructure/persistence/mappers/feature.mapper';
import { API_VERS, HeaderKeys, StorageKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetHeaderKey, HeaderKey, } from '@/common/decorators'
import { PermissionAction } from '@/common/enum';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { AbacGuard } from '../guards/abac.guard';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { CheckAbac } from '@/common/decorators/check-abac.decorator';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { GetFeatureByIdQuery, GetFeatureBySlugQuery } from '../../application/dtos/queries/feature-query.dto';
import { StatsGrowInfo, StatsPercentInfo } from '@/common/interfaces/stats.interface';

const name = 'features';

@ApiTags(name)
@Controller(API_VERS.V1 + `/${name}`)
export class FeatureController {
  constructor(
    private readonly commandHandler: FeatureCommandHandler,
    private readonly queryHandler: FeatureQueryHandler,
    private readonly cls: ClsService<MyClsStore>,
  ) { }

  @Get('percent-growth')
  @ApiOperation({ summary: 'Get feature percent growth stats' })
  @ApiBearerAuth()
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard)
  async percentGrowth(
    @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string,
    @Query('period') period: string,
  ): Promise<StatsPercentInfo> {
    return await this.queryHandler.percentGrowth(orgId, period);
  }

  @Get('growth/:orgId')
  @ApiOperation({ summary: 'Get feature growth stats' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async growth(
    @Param('orgId') orgId: string,
    @Query('period') period?: string,
  ): Promise<StatsGrowInfo> {
    return await this.queryHandler.handleGetFeatureGrowth(orgId, period);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new feature' })
  @ApiResponse({ status: 201, description: 'Feature created successfully', type: FeatureResponseDto, })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Feature with slug already exists' })
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.CREATE, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async create(
    @Body() createFeatureDto: CreateFeatureDto,
  ): Promise<FeatureResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: CreateFeatureArgs = {
      ...createFeatureDto,
      organization_id: orgId,
    };
    const feature = await this.commandHandler.handleCreateFeature(command);
    return FeatureMapper.toResponseDto(feature);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by ID' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature found',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getById(@Param('id') id: string): Promise<FeatureResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetFeatureByIdQuery = { id, organization_id: orgId };
    const feature = await this.queryHandler.handleGetFeatureById(query);

    if (!feature) {
      throw new Error('Feature not found');
    }

    return FeatureMapper.toResponseDto(feature);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get feature by slug' })
  @ApiParam({ name: 'slug', description: 'Feature slug' })
  @ApiResponse({
    status: 200,
    description: 'Feature found',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<FeatureResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const query: GetFeatureBySlugQuery = { slug, organization_id: orgId };
    const feature = await this.queryHandler.handleGetFeatureBySlug(query);

    if (!feature) {
      throw new Error('Feature not found');
    }

    return FeatureMapper.toResponseDto(feature);
  }

  @Get()
  @ApiOperation({ summary: 'List features with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Features retrieved successfully',
    type: PaginateFeaturesResponseDto,
  })
  @HeaderKey(HeaderKeys.ORG_ID, HeaderKeys.PROJECT_ID)
  @CheckAbac(PermissionAction.READ, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async pagination(
    @Query() listQuery: PaginateFeaturesQuery,
    @GetHeaderKey(HeaderKeys.PROJECT_ID) projectId: string,
  ): Promise<PaginateFeaturesResponseDto> {
    listQuery.project_id = projectId;
    const result = await this.queryHandler.handlePaginate(listQuery);

    return {
      data: result.data.map((feature) =>
        FeatureMapper.toResponseDto(feature),
      ),
      paginated: result.paginated,
    };
  }

  @Get('cursor')
  @ApiOperation({ summary: 'List features with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Features retrieved successfully',
    type: CursorFeaturesResponseDto,
  })
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.READ, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async cursorPagination(
    @Query() listQuery: CursorFeaturesQuery,
  ): Promise<CursorFeaturesResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);

    return {
      data: result.data.map((feature) =>
        FeatureMapper.toResponseDto(feature),
      ),
      paginated: result.paginated,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({
    status: 200,
    description: 'Feature updated successfully',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  @ApiResponse({ status: 409, description: 'Feature with slug already exists' })
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.UPDATE, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async update(
    @Param('id') id: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ): Promise<FeatureResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: UpdateFeatureArgs = {
      id,
      ...updateFeatureDto,
      organization_id: orgId,
    };
    const feature = await this.commandHandler.handleUpdateFeature(command);
    return FeatureMapper.toResponseDto(feature);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feature' })
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ApiResponse({ status: 204, description: 'Feature deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @HeaderKey(HeaderKeys.PROJECT_ID, HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.DELETE, 'Feature')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, TenantContextGuard, AbacGuard)
  async delete(
    @Param('id') id: string,
  ): Promise<void> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const command: DeleteFeatureArgs = {
      id,
      organization_id: orgId,
    };
    await this.commandHandler.handleDeleteFeature(command);
  }
}
