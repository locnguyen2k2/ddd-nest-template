import { ApiProperty } from '@nestjs/swagger';

export class FeatureResponseDto {
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

export class ListFeaturesResponseDto {
    @ApiProperty({ type: [FeatureResponseDto] })
    features!: FeatureResponseDto[];

    @ApiProperty()
    pagination!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
