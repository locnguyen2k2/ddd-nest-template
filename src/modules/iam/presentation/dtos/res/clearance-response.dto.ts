import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { Type } from 'class-transformer';

export class ClearanceResponseDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  level: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(id: string, name: string, level: number, description?: string | null) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.description = description ?? undefined;
  }
}

export class PaginateClearancesResponseDto {
  @ApiProperty({ type: [ClearanceResponseDto] })
  data!: ClearanceResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorClearancesResponseDto {
  @ApiProperty({ type: [ClearanceResponseDto] })
  data!: ClearanceResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
