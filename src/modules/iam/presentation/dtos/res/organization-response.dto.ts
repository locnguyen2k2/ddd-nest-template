import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
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

export class ListOrganizationsResponseDto {
    @ApiProperty({ type: [OrganizationResponseDto] })
    organizations!: OrganizationResponseDto[];

    @ApiProperty()
    pagination!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
