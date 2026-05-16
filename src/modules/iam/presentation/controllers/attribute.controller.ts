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
  CreateAttributeDto,
  CursorAttributesQuery,
  PaginateAttributesQuery,
  UpdateAttributeDto,
} from '../dtos/req/attribute-request.dto';
import {
  AttributeResponseDto,
  CursorAttributesResponseDto,
  PaginateAttributesResponseDto,
} from '../dtos/res/attribute-response.dto';
import { AttributeCommandHandler } from '@/modules/iam/application/services/attributes/command.handler';
import { AttributeQueryHandler } from '@/modules/iam/application/services/attributes/query.handler';
import { AttributeMapper } from '@/modules/iam/infrastructure/persistence/mappers/attribute.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '@/modules/iam/presentation/guards/jwt-auth.guard';

@ApiTags('attributes')
@Controller(API_VERS.V1 + '/attributes')
export class AttributeController {
  constructor(
    private readonly commandHandler: AttributeCommandHandler,
    private readonly queryHandler: AttributeQueryHandler,
  ) {}

  @Get('cursor')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List attributes with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Attributes retrieved successfully',
    type: CursorAttributesResponseDto,
  })
  async cursorPagination(
    @Query() listQuery: CursorAttributesQuery,
  ): Promise<CursorAttributesResponseDto> {
    const result = await this.queryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => AttributeMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @Get('entity-type/:type')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attributes by entity type' })
  @ApiParam({ name: 'type' })
  @ApiResponse({ status: 200, type: [AttributeResponseDto] })
  async findByEntityType(
    @Param('type') type: string,
  ): Promise<AttributeResponseDto[]> {
    const attributes = await this.queryHandler.findByEntityType(type);
    return attributes.map(AttributeMapper.toResponseDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AttributeResponseDto })
  async findById(@Param('id') id: string): Promise<AttributeResponseDto> {
    const attribute = await this.queryHandler.findById(id);
    if (!attribute) {
      throw new Error('Attribute not found');
    }
    return AttributeMapper.toResponseDto(attribute);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List attributes with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Attributes retrieved successfully',
    type: PaginateAttributesResponseDto,
  })
  async pagination(
    @Query() listQuery: PaginateAttributesQuery,
  ): Promise<PaginateAttributesResponseDto> {
    return await this.queryHandler.handlePaginate(listQuery);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, type: AttributeResponseDto })
  async create(@Body() dto: CreateAttributeDto): Promise<AttributeResponseDto> {
    const attribute = await this.commandHandler.handleCreate(dto);
    return AttributeMapper.toResponseDto(attribute);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: AttributeResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeDto,
  ): Promise<AttributeResponseDto> {
    const attribute = await this.commandHandler.handleUpdate({ id, ...dto });
    return AttributeMapper.toResponseDto(attribute);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDelete({ id });
  }
}
