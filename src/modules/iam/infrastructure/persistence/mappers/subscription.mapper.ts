import { SubscriptionEntity } from '@/modules/iam/domain/entities/subscription.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Subscription as PrismaSubscription, Prisma } from '@internal/rbac/client';
import { SubscriptionResponseDto } from '@/modules/iam/presentation/dtos/res/subscription-response.dto';

export class SubscriptionMapper {
  static toDomain(props: PrismaSubscription): SubscriptionEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return SubscriptionEntity.create({
      id: id,
      name: props.name,
      slug: props.slug,
      description: props.description,
    });
  }

  static toPrisma(props: SubscriptionEntity): PrismaSubscription {
    return {
      id: props.id.value,
      name: props.name,
      slug: props.slug,
      description: props.description,
      created_at: props.created_at!,
      updated_at: props.updated_at || new Date(),
    };
  }

  static toPrismaCreate(subscription: SubscriptionEntity): Prisma.SubscriptionCreateInput {
    return {
      id: subscription.id.value,
      name: subscription.name,
      slug: subscription.slug,
      description: subscription.description,
      created_at: subscription.created_at!,
      updated_at: subscription.updated_at!,
    };
  }

  static toPrismaUpdate(subscription: SubscriptionEntity): Prisma.SubscriptionUpdateInput {
    return {
      name: subscription.name,
      slug: subscription.slug,
      description: subscription.description,
      created_at: subscription.created_at!,
      updated_at: subscription.updated_at!,
    };
  }

  static toResponseDto(subscription: SubscriptionEntity): SubscriptionResponseDto {
    return new SubscriptionResponseDto(
      subscription.id.value,
      subscription.name,
      subscription.slug,
      subscription.description,
    );
  }
}
