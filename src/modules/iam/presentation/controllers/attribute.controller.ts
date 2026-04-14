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
import { CreateAttributeDto, UpdateAttributeDto } from '../dtos/req/attribute-request.dto';
import { AttributeResponseDto } from '../dtos/res/attribute-response.dto';
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
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, type: AttributeResponseDto })
  async create(@Body() dto: CreateAttributeDto): Promise<AttributeResponseDto> {
    const attribute = await this.commandHandler.handleCreate(dto);
    return AttributeMapper.toResponseDto(attribute);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all attributes' })
  @ApiResponse({ status: 200, type: [AttributeResponseDto] })
  async findAll(): Promise<AttributeResponseDto[]> {
    const attributes = await this.queryHandler.findAll();
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

  @Get('entity-type/:type')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attributes by entity type' })
  @ApiParam({ name: 'type' })
  @ApiResponse({ status: 200, type: [AttributeResponseDto] })
  async findByEntityType(@Param('type') type: string): Promise<AttributeResponseDto[]> {
    const attributes = await this.queryHandler.findByEntityType(type);
    return attributes.map(AttributeMapper.toResponseDto);
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
