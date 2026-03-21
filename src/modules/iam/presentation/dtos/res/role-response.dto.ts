import { CursorPaginationDto, PaginationDto } from '@/common/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RoleResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}

export class PaginateRolesResponseDto {
    @ApiProperty({ type: [RoleResponseDto] })
    roles!: RoleResponseDto[];

    @ApiProperty({ type: PaginationDto })
    @Type(() => PaginationDto)
    paginated!: PaginationDto;
}

export class CursorRolesResponseDto {
    @ApiProperty({ type: [RoleResponseDto] })
    roles!: RoleResponseDto[];

    @ApiProperty({ type: CursorPaginationDto })
    paginated!: CursorPaginationDto;
}
