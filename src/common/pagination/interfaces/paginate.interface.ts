import { BasePageOptionDto } from "../dtos/page-options.dto";

export interface IPagination {
  pageOptions: BasePageOptionDto;
  numberRecords: number;
}

export interface IPageOptions {
  query: any;
  pageOptions: BasePageOptionDto;
  filterOptions?: any[];
  // searchOption: ISearchOptions;
  include?: any;
  select?: any;
}
