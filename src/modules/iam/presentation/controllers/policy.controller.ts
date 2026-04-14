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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePolicyDto, UpdatePolicyDto } from '../dtos/req/policy.dto';
import { PolicyResponseDto } from '../dtos/res/policy-response.dto';
import { PolicyCommandHandler } from '../../application/services/policy/command.handler';
import { PolicyQueryHandler } from '../../application/services/policy/query.handler';
import { API_VERS, StorageKeys } from '@/common/constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { ClsService } from 'nestjs-cls';
import { MyClsStore } from '@/common/interfaces/cls-store.interface';

@ApiTags('policies')
@ApiBearerAuth()
@Controller(API_VERS.V1 + '/organizations/:orgId/policies')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class PolicyController {
  constructor(
    private readonly policyCmdHandler: PolicyCommandHandler,
    private readonly policyQueryHandler: PolicyQueryHandler,
    private readonly cls: ClsService<MyClsStore>,
  ) { }

  @Get()
  @ApiOperation({ summary: 'List organization-specific policies' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
    type: [PolicyResponseDto],
  })
  async list(): Promise<PolicyResponseDto[]> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const policies = await this.policyQueryHandler.handleGetPolicies({ organizationId: orgId });
    return policies.map(p => PolicyResponseDto.fromDomain(p));
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom policy' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: PolicyResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePolicyDto,
  ): Promise<PolicyResponseDto> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    const policy = await this.policyCmdHandler.handleCreatePolicy({
      ...dto,
      organizationId: orgId,
    });
    return PolicyResponseDto.fromDomain(policy);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update policy' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
    type: PolicyResponseDto,
  })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a policy' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Policy removed successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
  ): Promise<void> {
    const orgId = this.cls.get(StorageKeys.ORG_ID);
    await this.policyCmdHandler.handleDeletePolicy({
      id,
      organizationId: orgId,
    });
  }
}
