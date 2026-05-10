import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { CreateMemberDto, UpdateMemberDto } from '../dtos/req/member.dto';
import { MemberResponseDto } from '../dtos/res/member-response.dto';
import { MemberCommandHandler } from '@/modules/iam/application/services/member/command.handler';
import { MemberQueryHandler } from '@/modules/iam/application/services/member/query.handler';
import { MemberMapper } from '@/modules/iam/infrastructure/persistence/mappers/member.mapper';
import { API_VERS } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('members')
@Controller(API_VERS.V1 + '/members')
export class MemberController {
  constructor(
    private readonly commandHandler: MemberCommandHandler,
    private readonly queryHandler: MemberQueryHandler,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, type: MemberResponseDto })
  async create(@Body() dto: CreateMemberDto): Promise<MemberResponseDto> {
    const member = await this.commandHandler.handleCreateMember(dto);
    return MemberMapper.toResponseDto(member);
  }

  @Get('project/:projectId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get members by project ID' })
  @ApiParam({ name: 'projectId' })
  @ApiResponse({ status: 200, type: [MemberResponseDto] })
  async findByProjectId(@Param('projectId') projectId: string): Promise<MemberResponseDto[]> {
    const members = await this.queryHandler.handleGetMembersByProjectId({ project_id: projectId });
    return members.map(MemberMapper.toResponseDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  async findById(@Param('id') id: string): Promise<MemberResponseDto> {
    const member = await this.queryHandler.handleGetMemberById({ id });
    if (!member) {
      throw new Error('Member not found');
    }
    return MemberMapper.toResponseDto(member);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a member' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const member = await this.commandHandler.handleUpdateMember({ id, ...dto });
    return MemberMapper.toResponseDto(member);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandHandler.handleDeleteMember({ id });
  }
}
