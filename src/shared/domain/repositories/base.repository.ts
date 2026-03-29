import {
  BaseCursorPageOptionDto,
  BasePageOptionDto,
  CursorPageDto,
  PageDto,
} from '@/common/pagination';

export interface IPaginate<T> {
  paginate<P extends BasePageOptionDto>(args: P): Promise<PageDto<T>>;
}

export interface ICursor<T> {
  cursorPagination<P extends BaseCursorPageOptionDto>(
    args: P,
  ): Promise<CursorPageDto<T>>;
}
