import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Effect, PolicyEntity } from '../../../domain/entities/policy.entity';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { Type } from 'class-transformer';

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: Effect })
  effect!: Effect;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  resource!: string;

  @ApiProperty()
  condition!: any;

  @ApiProperty({ required: false })
  organization_id?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  static fromDomain(entity: PolicyEntity): PolicyResponseDto {
    return {
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      effect: entity.effect,
      action: entity.action,
      resource: entity.resource,
      condition: entity.condition,
      organization_id: entity.organizationId,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}

export class PaginatePoliciesResponseDto {
  @ApiProperty({ type: [PolicyResponseDto] })
  data!: PolicyResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorPoliciesResponseDto {
  @ApiProperty({ type: [PolicyResponseDto] })
  data!: PolicyResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}

export class EvaluatedPolicyDto extends PolicyResponseDto {
  @ApiProperty()
  status!: 'APPLIED' | 'MATCHED' | 'NOT_MATCHED';

  @ApiPropertyOptional({ example: 'P50' })
  priority?: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ enum: Effect })
  decision!: Effect;

  @ApiProperty({ type: [EvaluatedPolicyDto] })
  evaluated_policies!: EvaluatedPolicyDto[];

  @ApiProperty()
  context!: any;
}
