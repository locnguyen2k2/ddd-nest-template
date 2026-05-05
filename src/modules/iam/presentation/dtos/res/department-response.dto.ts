import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DepartmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  organization_id!: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}

export class PaginateDepartmentsResponseDto {
  @ApiProperty({ type: [DepartmentResponseDto] })
  data!: DepartmentResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorDepartmentsResponseDto {
  @ApiProperty({ type: [DepartmentResponseDto] })
  data!: DepartmentResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
