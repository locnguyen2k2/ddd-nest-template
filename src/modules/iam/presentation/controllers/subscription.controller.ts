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
import {
  CreateSubscriptionDto,
  CursorSubscriptionsQuery,
  PaginateSubscriptionsQuery,
  UpdateSubscriptionDto,
} from '../dtos/req/subscription-request.dto';
import {
  SubscriptionResponseDto,
  CursorSubscriptionsResponseDto,
  PaginateSubscriptionsResponseDto,
} from '../dtos/res/subscription-response.dto';
import { SubscriptionCommandHandler } from '@/modules/iam/application/services/subscription/command.handler';
import { SubscriptionQueryHandler } from '@/modules/iam/application/services/subscription/query.handler';
import { SubscriptionMapper } from '@/modules/iam/infrastructure/persistence/mappers/subscription.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';

@ApiTags('subscriptions')
@Controller(API_VERS.V1 + '/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandHandler: SubscriptionCommandHandler,
    private readonly queryHandler: SubscriptionQueryHandler,
  ) {}

  @Get('cursor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List subscriptions with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: CursorSubscriptionsResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorSubscriptionsQuery,
  ): Promise<CursorSubscriptionsResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => SubscriptionMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @Get('slug/:slug')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.queryHandler.findBySlug(slug);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    return SubscriptionMapper.toResponseDto(subscription);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async findById(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.queryHandler.findById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    return SubscriptionMapper.toResponseDto(subscription);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List subscriptions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully',
    type: PaginateSubscriptionsResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateSubscriptionsQuery,
  ): Promise<PaginateSubscriptionsResponseDto> {
    return await this.queryHandler.handlePaginate(listQuery);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, type: SubscriptionResponseDto })
  async create(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.commandHandler.handleCreate(dto);
    return SubscriptionMapper.toResponseDto(subscription);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.commandHandler.handleUpdate({ id, ...dto });
    return SubscriptionMapper.toResponseDto(subscription);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDelete({ id });
  }
}
