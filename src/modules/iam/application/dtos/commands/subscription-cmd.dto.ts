export class CreateSubscriptionCommand {
  name!: string;
  slug!: string;
  description?: string;
}

export class UpdateSubscriptionCommand {
  id!: string;
  name?: string;
  slug?: string;
  description?: string;
}

export class DeleteSubscriptionCommand {
  id!: string;
}

export class GetSubscriptionByIdQuery {
  id!: string;
}

export class GetSubscriptionBySlugQuery {
  slug!: string;
}
