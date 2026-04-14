import { AccessControlStatus } from '@/common/enum';
import { ApiProperty } from '@nestjs/swagger';

export class MemberResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  staff_id!: string;

  @ApiProperty()
  project_id!: string;

  @ApiProperty({ enum: AccessControlStatus })
  status!: AccessControlStatus;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}
