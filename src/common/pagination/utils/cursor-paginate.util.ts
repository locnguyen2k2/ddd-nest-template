import { BusinessException } from '@/common/http/business-exception';
import {
  CursorPageDto,
  CursorPaginationDto,
} from '../dtos/cursor-page-options.dto';
import { ICursorPageOptions } from '../interfaces';
import { SortableFieldEnum, SortedEnum } from '../dtos';

export const decodedCursor = (
  cursor: string,
): {
  id: string;
  created_at: string;
} => {
  const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
  const [id, created_at] = decodedCursor.split('|');
  const timestamp = new Date(created_at).getTime();
  if (isNaN(timestamp)) {
    throw new BusinessException(`400|Invalid cursor: ${cursor}`);
  }
  return { id, created_at };
};

export const encodeCursor = (id: string, created_at: string): string => {
  return Buffer.from(`${id}|${created_at}`).toString('base64');
};

export const cursorHelper = async <T>({
  query,
  pageOptions,
  filterOptions,
  include = {},
  select = {},
  cursorField = SortableFieldEnum.CREATED_AT,
}: ICursorPageOptions): Promise<CursorPageDto<T>> => {
  const { from_date, to_date, sort, limit, cursor, direction } = pageOptions;
  const where: any = {};

  // Apply filter options
  if (filterOptions && filterOptions.length > 0) {
    filterOptions.map((option: object) => {
      const key = Object.keys(option)[0];
      where[key] = option[key];
    });
  }

  // Apply date range filter if not getting all records
  if (!pageOptions.all) {
    where.created_at = {
      ...(pageOptions.from_date && { gte: new Date(from_date) }),
      ...(pageOptions.to_date && { lt: new Date(to_date) }),
    };
  }

  // Apply cursor-based pagination
  if (cursor) {
    const { created_at, id } = decodedCursor(cursor);
    const cursorDate = new Date(created_at);

    if (direction === 'prev') {
      where[cursorField] = {
        gt: cursorDate,
      };
      where['id'] = {
        gt: id,
      };
    } else {
      // Next page (default), records before the cursor (older records)
      where[cursorField] = {
        lte: cursorDate,
      };
      where['id'] = {
        lt: id,
      };
    }
  }

  try {
    // Get one extra record to check if there's a next page
    const requestLimit = pageOptions.all ? undefined : limit + 1;

    // Determine sort order based on direction and orderDirection
    let actualSorted = SortedEnum.DESC;
    if (direction === 'prev') {
      // Reverse the order for previous page, then reverse results
      actualSorted = SortedEnum.ASC;
    }

    const [entities, totalCount] = await Promise.all([
      query.findMany({
        where,
        orderBy: {
          [cursorField]: actualSorted,
        },
        ...(include ? { include } : select ? { select } : {}),
        ...(!pageOptions.all && { take: requestLimit }),
      }),
      // Get total count for the base query (without cursor)
      (() => {
        const countWhere = { ...where };
        return query.count({ where: countWhere });
      })(),
    ]);

    let resultEntities = entities;
    let hasNextPage = false;
    let hasPrevPage = !!cursor;

    if (!pageOptions.all && entities.length > limit) {
      // Remove the extra record
      resultEntities = entities.slice(0, limit);
      hasNextPage = true;
    }

    // If get previous page, reverse the results back to correct order
    if (direction === 'prev') {
      resultEntities = resultEntities.reverse();
      // For previous page, cursor ? -> next page
      // prev page = limit + 1 records
      const tempHasNext = hasPrevPage;
      hasPrevPage = hasNextPage;
      hasNextPage = tempHasNext;
    }

    // Determine cursors for next/prev pages
    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (resultEntities.length > 0) {
      const firstRecord = resultEntities[0];
      const lastRecord = resultEntities[resultEntities.length - 1];

      if (hasNextPage && lastRecord && lastRecord?.cursorField) {
        nextCursor = encodeCursor(
          lastRecord.id,
          lastRecord[cursorField].toISOString(),
        );
      }

      if (hasPrevPage && firstRecord && firstRecord?.cursorField) {
        prevCursor = encodeCursor(
          firstRecord.id,
          firstRecord[cursorField].toISOString(),
        );
      }
    }

    const pageMetaDto = new CursorPaginationDto({
      numberRecords: totalCount,
      pageOptions,
      hasNextPage,
      hasPrevPage,
      nextCursor,
      prevCursor,
    });

    return new CursorPageDto(resultEntities, pageMetaDto);
  } catch (e: any) {
    throw new BusinessException(`400:${e.message}`);
  }
};
