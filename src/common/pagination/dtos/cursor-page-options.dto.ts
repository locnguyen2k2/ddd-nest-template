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
import { resetHours } from '@/utils/date';
import { BusinessException } from '@/common/http/business-exception';
import { ICursorPagination } from '../interfaces';
import { SortableFieldEnum, SortedEnum } from './page-options.dto';
import { decodedCursor } from '../utils';

export class BaseCursorPageOptionDto {
    @ApiPropertyOptional({ default: '' })
    @IsString()
    @IsOptional()
    readonly keyword: string = '';

    @ApiPropertyOptional({
        default: resetHours(`${new Date()}`),
        description:
            'Filter records was created from date - if not provided, will use cursor as default',
    })
    @IsDateString()
    @IsOptional()
    @Transform(({ value, obj }) => {
        if (value) {
            return resetHours(`${value}`);
        }

        if (obj.cursor) {
            const { created_at } = decodedCursor(obj.cursor);
            return resetHours(`${new Date(created_at)}`);
        }

        return resetHours(`${new Date()}`);
    })
    readonly from_date: string | null = null;

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
    readonly to_date: string | null = resetHours(
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

    @ApiPropertyOptional({
        default: 10,
        description: 'Number of records per page (limit)',
    })
    @Min(1)
    @Max(1000)
    @IsNumber()
    @IsOptional()
    limit: number = 10;

    @ApiPropertyOptional({
        description:
            'Cursor for pagination - use the cursor from previous response to get next page',
        example: '2024-01-15T10:30:00.000Z',
    })
    @IsString()
    @IsOptional()
    cursor?: string;

    @ApiPropertyOptional({
        description: 'Direction for cursor pagination',
        enum: ['next', 'prev'],
        default: 'next',
    })
    @IsString()
    @IsOptional()
    readonly direction?: 'next' | 'prev' = 'next';
}

// Cursor Pagination response
export class CursorPaginationDto {
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
    limit: number;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    cursor?: string;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly direction: string;

    @Min(0)
    @IsOptional()
    @IsNumber()
    @Expose()
    @ApiProperty()
    number_records: number;

    @IsOptional()
    @IsBoolean()
    @Expose()
    @ApiProperty()
    has_next: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose()
    @ApiProperty()
    readonly has_prev: boolean;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    next_cursor?: string;

    @IsString()
    @IsOptional()
    @Expose()
    @ApiProperty()
    readonly prev_cursor?: string;

    constructor({
        pageOptions,
        numberRecords,
        hasNextPage,
        hasPrevPage,
        nextCursor,
        prevCursor,
    }: ICursorPagination) {
        this.keyword = pageOptions.keyword;
        this.limit = pageOptions.limit;
        this.sort = pageOptions.sort;
        this.sorted = pageOptions.sorted;
        this.from_date = pageOptions.from_date;
        this.to_date = pageOptions.to_date;
        this.direction = pageOptions.direction;
        this.number_records = numberRecords;
        this.has_next = hasNextPage;
        this.has_prev = hasPrevPage;
        this.next_cursor = nextCursor;
        this.prev_cursor = prevCursor;
    }
}

export class CursorPageDto<T> {
    data: T[];
    paginated: CursorPaginationDto;

    constructor(data: T[], paginated: CursorPaginationDto) {
        this.data = data;
        this.paginated = paginated;
    }
}
