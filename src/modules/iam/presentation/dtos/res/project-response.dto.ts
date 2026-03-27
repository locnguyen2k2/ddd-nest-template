import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProjectResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    organization_id!: string;

    @ApiProperty({ required: false })
    created_by?: string;

    @ApiProperty({ required: false })
    updated_by?: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

export class PaginateProjectsResponseDto {
    @ApiProperty({ type: [ProjectResponseDto] })
    projects!: ProjectResponseDto[];

    @ApiProperty({ type: PaginationDto })
    @Type(() => PaginationDto)
    paginated!: PaginationDto;
}

export class CursorProjectsResponseDto {
    @ApiProperty({ type: [ProjectResponseDto] })
    projects!: ProjectResponseDto[];

    @ApiProperty({ type: CursorPaginationDto })
    @Type(() => CursorPaginationDto)
    paginated!: CursorPaginationDto;
}
