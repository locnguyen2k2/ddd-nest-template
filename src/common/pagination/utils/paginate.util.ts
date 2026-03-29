import { IPageOptions } from '../interfaces';
import { PageDto, PaginationDto } from '../dtos/page-options.dto';
import { BusinessException } from '@/common/http/business-exception';

export const paginateHelper = async <T>({
  query,
  pageOptions,
  filterOptions,
  include = null,
  select = null,
}: IPageOptions): Promise<PageDto<T>> => {
  const { from_date, to_date, sort, sorted, take, page } = pageOptions;
  const skip = (page - 1) * take;
  const where: any = {};

  if (filterOptions && filterOptions.length > 0) {
    filterOptions.map((option: object) => {
      const key = Object.keys(option)[0];
      where[key] = option[key];
    });
  }

  if (!pageOptions.all)
    where.created_at = {
      ...(pageOptions.from_date && { gte: new Date(from_date) }),
      ...(pageOptions.to_date && { lt: new Date(to_date) }),
    };

  try {
    const [entities, numberRecords] = await Promise.all([
      query.findMany({
        where,
        orderBy: {
          [`${sort}`]: `${sorted}`,
        },
        ...(include && { include }),
        ...(select && { select }),
        ...(!pageOptions.all && { skip, take }),
      }),
      query.count({ where }),
    ]);
    const pageMetaDto = new PaginationDto({ numberRecords, pageOptions });

    return new PageDto(entities, pageMetaDto);
  } catch (e: any) {
    throw new BusinessException(`400:${e}`);
  }
};
