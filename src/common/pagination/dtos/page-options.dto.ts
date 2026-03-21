import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import moment from 'moment/moment';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessException } from '@/common/http/business-exception';
import { resetHours } from '@/utils/date';
import { IPagination } from '../interfaces';

export enum SortedEnum {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortableFieldEnum {
    CREATED_AT = 'created_at',
    UPDATED_AT = 'updated_at',
}

export class BasePageOptionDto {
    @ApiPropertyOptional({ default: '' })
    @IsString()
    @IsOptional()
    readonly keyword: string = '';

    @ApiPropertyOptional({
        default: resetHours(`${new Date()}`),
        description: 'Filter records was created from date',
    })
    @IsDateString()
    @IsOptional()
    @Transform(({ value }) => resetHours(`${value}`))
    readonly from_date: string = resetHours(`${new Date()}`);

    @ApiPropertyOptional({
        default: resetHours(`${new Date()}`),
        description: 'Filter records was created to date',
    })
    @IsDateString()
    @IsOptional()
    @Transform(({ value, obj }) => {
        const date = value ? new Date(value) : new Date();
        if (
            obj.from_date &&
            (obj.from_date.valueOf() > date.valueOf() ||
                date.valueOf() > new Date().valueOf())
        )
            throw new BusinessException(`400:Date invalid!`);

        const toDate = moment(date).set('date', moment(date).get('date') + 1);
        return resetHours(`${toDate.format('YYYY-MM-DD HH:mm:ss')}`);
    })
    readonly to_date: string = resetHours(
        `${moment(new Date())
            .set('date', moment(new Date()).get('date') + 1)
            .format('YYYY-MM-DD HH:mm:ss')}`,
    );

    @ApiPropertyOptional({
        default: SortableFieldEnum.CREATED_AT,
    })
    @IsString()
    @IsOptional()
    readonly sort: string = SortableFieldEnum.CREATED_AT;

    @ApiPropertyOptional({ enum: SortedEnum, default: SortedEnum.DESC })
    @IsOptional()
    @IsEnum(SortedEnum)
    readonly sorted?: SortedEnum = SortedEnum.DESC;

    @ApiPropertyOptional({
        description: 'Get all records from database',
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ obj }) => {
        if (obj?.all === 'true' || obj?.all === true) return true;
        if (obj?.all === 'false' || obj?.all === false) return false;
        return false;
    })
    @Expose()
    all?: boolean;

    @ApiPropertyOptional({ default: 1 })
    @Min(1)
    @IsOptional()
    @IsNumber()
    readonly page: number = 1;

    @ApiPropertyOptional({ default: 10, description: 'Number of records' })
    @Min(1)
    @Max(500)
    @IsNumber()
    @IsOptional()
    readonly take: number = 10;

    get skip(): number {
        return (this.page - 1) * this.take;
    }
}

// Pagination response
export class PaginationDto {
    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly keyword: string;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly sort: string;

    @IsOptional()
    @IsEnum(SortedEnum)
    @Expose()
    @ApiProperty()
    readonly sorted: SortedEnum;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly from_date: string;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly to_date: string;

    @Min(1)
    @IsOptional()
    @IsNumber()
    @Expose()
    @ApiProperty()
    readonly page: number;

    @Min(1)
    @IsOptional()
    @IsNumber()
    @Expose()
    @ApiProperty()
    readonly take: number;

    @Min(1)
    @IsOptional()
    @IsNumber()
    @Expose()
    @ApiProperty()
    readonly number_records: number;

    @Min(1)
    @IsOptional()
    @IsNumber()
    @Expose()
    @ApiProperty()
    readonly pages: number;

    @IsOptional()
    @IsBoolean()
    @Expose()
    @ApiProperty()
    readonly has_prev: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose()
    @ApiProperty()
    readonly has_next: boolean;

    constructor({ pageOptions, numberRecords }: IPagination) {
        this.keyword = pageOptions.keyword;
        this.page = pageOptions.page;
        this.take = !pageOptions.all ? pageOptions.take : numberRecords;
        this.sort = pageOptions.sort;
        this.sorted = pageOptions.sorted || SortedEnum.ASC;
        this.from_date = pageOptions.from_date;
        this.to_date = pageOptions.to_date;
        this.number_records = numberRecords;
        this.pages = Math.ceil(this.number_records / this.take)
            ? Math.ceil(this.number_records / this.take)
            : 0;
        this.has_prev = this.page > 1;
        this.has_next = this.page < this.pages;
    }
}

export class PageDto<T> {
    readonly data: T[];
    readonly paginated: PaginationDto;

    constructor(data: T[], paginated: PaginationDto) {
        this.data = data;
        this.paginated = paginated;
    }
}
