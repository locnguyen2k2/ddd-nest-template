export interface ICursorPageOptions {
  query: any;
  pageOptions: any;
  filterOptions?: object[];
  include?: object;
  select?: object;
  cursorField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface ICursorSqlRawOptions extends Omit<
  ICursorPageOptions,
  'select' | 'query'
> {
  table: string;
  select?: string[];
  join?: string;
}

export interface ICursorPagination {
  pageOptions: any;
  numberRecords: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: string;
  prevCursor?: string;
}
