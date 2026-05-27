import { BaseCursorPageOptionDto, BasePageOptionDto } from "@/common/pagination";

export class PaginateLogsQuery extends BasePageOptionDto {
    org_id?: string;
}

export class CursorLogsQuery extends BaseCursorPageOptionDto { 
    org_id?: string;
}