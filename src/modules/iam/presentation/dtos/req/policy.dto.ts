import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Effect } from '../../../domain/entities/policy.entity';
import { IsJsonLogic } from '@/common/validators/json-logic.validator';
import { BasePageOptionDto, BaseCursorPageOptionDto } from '@/common/pagination';

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

  @ApiProperty({ example: 'project:create' })
  @IsString()
  @IsNotEmpty()
  action!: string;

  @ApiProperty({ example: 'Project' })
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty({ example: { '==': [{ var: 'user.id' }, { var: 'resource.owner_id' }] } })
  @IsJsonLogic()
  @IsNotEmpty()
  condition!: any;
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) { }

export class PaginatePoliciesQuery extends BasePageOptionDto {
}

export class CursorPoliciesQuery extends BaseCursorPageOptionDto {
}