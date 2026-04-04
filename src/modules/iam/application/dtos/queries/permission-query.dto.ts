import { BaseCursorPageOptionDto, BasePageOptionDto } from "@/common/pagination";
import { PermissionAction } from "@/common/enum";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetPermissionByIdQuery {
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(data: any) {
    this.id = data.id;
  }
}

export class GetPermissionByActionQuery {
  @IsString()
  @IsNotEmpty()
  action: PermissionAction;

  constructor(data: any) {
    this.action = data.action;
  }
}

export class PaginatePermissionQuery extends BasePageOptionDto { }

export class CursorPermissionQuery extends BaseCursorPageOptionDto { }

