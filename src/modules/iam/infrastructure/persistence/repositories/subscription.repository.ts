import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository, SUBSCRIPTION_REPO } from '@/modules/iam/domain/repositories/subscription.repository';
import { SubscriptionEntity } from '@/modules/iam/domain/entities/subscription.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from '@/common/pagination';
import { CursorSubscriptionsQuery, PaginateSubscriptionsQuery } from '@/modules/iam/presentation/dtos/req/subscription-request.dto';
import { Prisma } from "@internal/rbac/client"

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaAdapter) { }

  async cursorPagination(pageOptions: CursorSubscriptionsQuery) {
    const { data = [], paginated } =
      await cursorHelper<Prisma.SubscriptionGetPayload<{}>>({
        query: this.prisma.subscription,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

    return {
      data: data.map((item) => SubscriptionMapper.toDomain(item)),
      paginated,
    };
  }

  async paginate(pageOptions: PaginateSubscriptionsQuery) {
    const { data = [], paginated } =
      await paginateHelper<Prisma.SubscriptionGetPayload<{}>>({
        query: this.prisma.subscription,
        pageOptions,
      });

    return {
      data: data.map((item) => SubscriptionMapper.toDomain(item)),
      paginated,
    };
  }

  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    const toPrisma = SubscriptionMapper.toPrismaCreate(subscription);
    const result = await this.prisma.subscription.create({ data: toPrisma });
    return SubscriptionMapper.toDomain(result);
  }

  async update(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    const toPrisma = SubscriptionMapper.toPrismaUpdate(subscription);
    const result = await this.prisma.subscription.update({
      where: { id: subscription.id.value },
      data: toPrisma,
    });
    return SubscriptionMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({ where: { id } });
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const result = await this.prisma.subscription.findUnique({ where: { id } });
    if (!result) return null;
    return SubscriptionMapper.toDomain(result);
  }

  async findBySlug(slug: string): Promise<SubscriptionEntity | null> {
    const result = await this.prisma.subscription.findUnique({ where: { slug } });
    if (!result) return null;
    return SubscriptionMapper.toDomain(result);
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    const results = await this.prisma.subscription.findMany();
    return results.map((result) => SubscriptionMapper.toDomain(result));
  }
}
