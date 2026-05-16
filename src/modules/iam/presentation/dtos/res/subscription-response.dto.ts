import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { Type } from 'class-transformer';

export class SubscriptionResponseDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(
    id: string,
    name: string,
    slug: string,
    description?: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description ?? undefined;
  }
}

export class PaginateSubscriptionsResponseDto {
  @ApiProperty({ type: [SubscriptionResponseDto] })
  data!: SubscriptionResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Type(() => PaginationDto)
  paginated!: PaginationDto;
}

export class CursorSubscriptionsResponseDto {
  @ApiProperty({ type: [SubscriptionResponseDto] })
  data!: SubscriptionResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
