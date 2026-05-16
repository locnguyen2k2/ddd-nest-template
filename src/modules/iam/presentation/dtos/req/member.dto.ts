import { AccessControlStatus } from '@/common/enum';
import {
  BaseCursorPageOptionDto,
  BasePageOptionDto,
} from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'uuid-v7-staff-id' })
  @IsString()
  @IsNotEmpty()
  staff_id!: string;

  @ApiProperty({ example: 'uuid-v7-project-id' })
  @IsString()
  @IsNotEmpty()
  project_id!: string;

  @ApiProperty({
    enum: AccessControlStatus,
    example: AccessControlStatus.ACTIVE,
    required: false,
  })
  @IsEnum(AccessControlStatus)
  @IsOptional()
  status?: AccessControlStatus;

  @ApiProperty({ example: { key: 'value' }, required: false })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateMemberDto {
  @ApiProperty({
    enum: AccessControlStatus,
    example: AccessControlStatus.ACTIVE,
  })
  @IsEnum(AccessControlStatus)
  @IsNotEmpty()
  status!: AccessControlStatus;
}

export class PaginateMembersQuery extends BasePageOptionDto {}

export class CursorMembersQuery extends BaseCursorPageOptionDto {}
