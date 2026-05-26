import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Effect } from '../../../domain/entities/policy.entity';
import { PermissionAction } from '@/common/enum';
import { IsJsonLogic } from '@/common/validators/json-logic.validator';
import {
  BasePageOptionDto,
  BaseCursorPageOptionDto,
} from '@/common/pagination';
import { Expose, Type } from 'class-transformer';

export enum Clearance {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export enum PlanTier {
  BASIC = 'basic',
  ENTERPRISE = 'enterprise',
}

export enum Sensitivity {}

export class SubjectAttributes {
  @ApiPropertyOptional({ example: 'developer' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ example: 'engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'L2' })
  @IsString()
  @IsOptional()
  clearance?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  mfa_verified?: boolean;

  @ApiPropertyOptional({ example: 'premium' })
  @IsString()
  @IsOptional()
  subscription?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsString()
  @IsOptional()
  location?: string;
}

export class ResourceAttributes {
  @ApiProperty({ example: 'project' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  type: string;

  @ApiProperty({ example: 'project-001' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  id: string;

  @ApiPropertyOptional({ example: 'internal' })
  @IsString()
  @IsOptional()
  @Expose()
  sensitivity?: string;

  @ApiPropertyOptional({ example: 'production' })
  @IsString()
  @IsOptional()
  @Expose()
  environment?: string;

  @ApiPropertyOptional({ example: 'org-001' })
  @IsString()
  @IsOptional()
  @Expose()
  user_id?: string;
}

export class EvaluationContextAttributes {
  @ApiPropertyOptional({ example: 'VPN' })
  @IsString()
  @IsOptional()
  network?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  risk_score?: number;
}

export class PolicyEvaluateDto {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @Type(() => SubjectAttributes)
  subject: SubjectAttributes;

  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @ValidateNested({ always: true })
  @Type(() => ResourceAttributes)
  resource: ResourceAttributes;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.READ })
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action!: PermissionAction;

  @ApiPropertyOptional()
  @IsOptional()
  context?: EvaluationContextAttributes;

  @ApiPropertyOptional({ example: 'org-123' })
  @IsString()
  @IsOptional()
  organization_id?: string;
}

export class CreatePolicyDto {
  @ApiProperty({ example: 'Create Project Policy' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Allows creating projects' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: Effect, example: Effect.ALLOW })
  @IsEnum(Effect)
  @IsNotEmpty()
  effect!: Effect;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.CREATE })
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action!: PermissionAction;

  @ApiProperty({ example: 'Project' })
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty({
    example: { '==': [{ var: 'user.id' }, { var: 'resource.owner_id' }] },
  })
  @IsJsonLogic()
  @IsNotEmpty()
  condition!: any;
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}

export class PaginatePoliciesQuery extends BasePageOptionDto {
  @ApiPropertyOptional({ example: 'CREATE' })
  @IsEnum(PermissionAction)
  @IsOptional()
  action?: PermissionAction;

  @ApiPropertyOptional({ example: 'Project' })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiPropertyOptional({ example: 'org-123' })
  @IsString()
  @IsOptional()
  organization_id?: string;
}

export class CursorPoliciesQuery extends BaseCursorPageOptionDto {
  @ApiPropertyOptional({ example: 'CREATE' })
  @IsEnum(PermissionAction)
  @IsOptional()
  action?: PermissionAction;

  @ApiPropertyOptional({ example: 'Project' })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiPropertyOptional({ example: 'org-123' })
  @IsString()
  @IsOptional()
  organization_id?: string;
}
