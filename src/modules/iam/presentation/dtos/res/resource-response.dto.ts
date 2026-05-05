import { CursorPaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ResourceResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  description!: string;
}

export class CursorResourcesResponseDto {
  @ApiProperty({ type: [ResourceResponseDto] })
  data!: ResourceResponseDto[];

  @ApiProperty({ type: CursorPaginationDto })
  @Type(() => CursorPaginationDto)
  paginated!: CursorPaginationDto;
}
