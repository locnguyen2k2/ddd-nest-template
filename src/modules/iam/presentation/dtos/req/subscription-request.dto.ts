import {
  BasePageOptionDto,
  BaseCursorPageOptionDto,
} from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Enterprise' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'enterprise' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ example: 'Enterprise', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'enterprise', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PaginateSubscriptionsQuery extends BasePageOptionDto {}

export class CursorSubscriptionsQuery extends BaseCursorPageOptionDto {}
