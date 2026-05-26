export class CreateClearanceCommand {
  name!: string;
  level!: number;
  description?: string;
}

export class UpdateClearanceCommand {
  id!: string;
  name?: string;
  level?: number;
  description?: string;
}

export class DeleteClearanceCommand {
  id!: string;
}

export class GetClearanceByIdQuery {
  id!: string;
}

export class GetClearanceByLevelQuery {
  level!: number;
}
