import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreatePolicyDto,
  CursorPoliciesQuery,
  PaginatePoliciesQuery,
  PolicyEvaluateDto,
  UpdatePolicyDto,
} from '../dtos/req/policy.dto';
import {
  CursorPoliciesResponseDto,
  EvaluationResponseDto,
  PaginatePoliciesResponseDto,
  PolicyResponseDto,
} from '../dtos/res/policy-response.dto';
import { CursorResourcesResponseDto } from '../dtos/res/resource-response.dto';
import { SortedEnum } from '@/common/pagination/dtos/page-options.dto';
import { PolicyCommandHandler } from '../../application/services/policy/command.handler';
import { PolicyQueryHandler } from '../../application/services/policy/query.handler';
import { PolicyEvaluationService } from '../../application/services/policy/policy-evaluation.service';
import { API_VERS, HeaderKeys, StorageKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';
import { CheckAbac } from '@/common/decorators/check-abac.decorator';
import { PolicyMapper } from '../../infrastructure/persistence/mappers/policy.mapper';
import { PermissionAction } from '@/common/enum';
import { AbacGuard } from '../guards/abac.guard';
import { HeadersAuthGuard } from '../guards/headers-auth.guard';
import { GetHeaderKey, HeaderKey, User } from '@/common/decorators';
import { IPayload } from '../../domain/services/auth.service';

@ApiTags('policies')
@ApiBearerAuth()
@Controller(API_VERS.V1 + '/policies')
export class PolicyController {
  constructor(
    private readonly policyCmdHandler: PolicyCommandHandler,
    private readonly policyQueryHandler: PolicyQueryHandler,
    private readonly policyEvaluationService: PolicyEvaluationService,
    private readonly cls: ClsService<MyClsStore>,
  ) { }

  @Post('organizations/:orgId/evaluate')
  @ApiOperation({ summary: 'Evaluate policy decision' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy evaluated successfully',
    type: EvaluationResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard,)
  async evaluate(
    @Body() dto: PolicyEvaluateDto,
    @User() user: IPayload,
  ): Promise<EvaluationResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    dto.resource.user_id = user.sub;
    return await this.policyEvaluationService.evaluate({
      ...dto,
      organization_id: orgId,
    });
  }

  @Get('organizations/:orgId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List policies with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
    type: PaginatePoliciesResponseDto,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.UPDATE, 'Organization')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  async pagination(
    @Query() listQuery: PaginatePoliciesQuery,
    @Param('orgId') orgId: string,
  ): Promise<PaginatePoliciesResponseDto> {
    listQuery.organization_id = orgId;
    return await this.policyQueryHandler.handlePaginate(listQuery);
  }

  @Get('organizations/:orgId/cursor')
  @ApiOperation({ summary: 'List policies with cursor pagination' })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
    type: CursorPoliciesResponseDto,
  })
  @CheckAbac(PermissionAction.READ, 'Policy')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  async cursorPagination(
    @Query() listQuery: CursorPoliciesQuery,
    @GetHeaderKey(HeaderKeys.ORG_ID) orgId: string,
  ): Promise<CursorPoliciesResponseDto> {
    listQuery.organization_id = orgId;
    const result =
      await this.policyQueryHandler.handleCursorPaginate(listQuery);
    return {
      data: result.data.map((item) => PolicyMapper.toResponse(item)),
      paginated: result.paginated,
    };
  }

  @Get('resources/cursor')
  @ApiOperation({ summary: 'List available resources' })
  @ApiResponse({
    status: 200,
    description: 'Resources retrieved successfully',
    type: CursorResourcesResponseDto,
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard,)
  async getResources(): Promise<CursorResourcesResponseDto> {
    const mockResources = [
      {
        name: 'Organization',
        slug: 'organization',
        description: 'Organization resource',
      },
      { name: 'Project', slug: 'project', description: 'Project resource' },
      { name: 'Feature', slug: 'feature', description: 'Feature resource' },
      { name: 'User', slug: 'user', description: 'User resource' },
    ];

    return {
      data: mockResources,
      paginated: {
        keyword: '',
        sort: 'created_at',
        sorted: SortedEnum.DESC,
        from_date: '',
        to_date: '',
        limit: 10,
        cursor: undefined,
        direction: 'next',
        number_records: mockResources.length,
        has_next: false,
        has_prev: false,
        next_cursor: undefined,
        prev_cursor: undefined,
      },
    };
  }
  @Post('organizations/:orgId')
  @ApiOperation({ summary: 'Create a custom policy' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: PolicyResponseDto,
  })
  @CheckAbac(PermissionAction.CREATE, 'Policy')
  @HeaderKey(HeaderKeys.ORG_ID)
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePolicyDto): Promise<PolicyResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const policy = await this.policyCmdHandler.handleCreatePolicy({
      ...dto,
      organizationId: orgId,
    });
    return PolicyResponseDto.fromDomain(policy);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update policy' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
    type: PolicyResponseDto,
  })
  @CheckAbac(PermissionAction.UPDATE, 'Policy')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
  ): Promise<PolicyResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const policy = await this.policyCmdHandler.handleUpdatePolicy({
      ...dto,
      id,
      organizationId: orgId,
    });
    return PolicyResponseDto.fromDomain(policy);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remove a policy' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Policy removed successfully',
  })
  @HeaderKey(HeaderKeys.ORG_ID)
  @CheckAbac(PermissionAction.DELETE, 'Policy')
  @UseGuards(JwtAuthGuard, HeadersAuthGuard, AbacGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    await this.policyCmdHandler.handleDeletePolicy({
      id,
      organizationId: orgId,
    });
  }
}
