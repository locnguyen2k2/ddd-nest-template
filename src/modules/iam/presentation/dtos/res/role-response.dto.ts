import { ApiProperty } from '@nestjs/swagger';

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
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class ListRolesResponseDto {
    @ApiProperty({ type: [RoleResponseDto] })
    roles!: RoleResponseDto[];

    @ApiProperty()
    pagination!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
