import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { Type } from 'class-transformer';

export class AttributeResponseDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  entity_type: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  data_type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  constructor(
    id: string,
    entity_type: string,
    key: string,
    data_type: string,
    description?: string | null,
    label?: string | null,
    category?: string | null,
  ) {
    this.id = id;
    this.entity_type = entity_type;
    this.key = key;
    this.data_type = data_type;
    this.description = description ?? undefined;
    this.label = label ?? undefined;
    this.category = category ?? undefined;
  }
}

export class PaginateAttributesResponseDto {
  @ApiProperty({ type: [AttributeResponseDto] })
  data!: AttributeResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorAttributesResponseDto {
  @ApiProperty({ type: [AttributeResponseDto] })
  data!: AttributeResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
