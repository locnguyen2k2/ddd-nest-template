import { Injectable } from '@nestjs/common';
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPO,
} from '@/modules/iam/domain/repositories/subscription.repository';
import { SubscriptionEntity } from '@/modules/iam/domain/entities/subscription.entity';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorSubscriptionsQuery,
  PaginateSubscriptionsQuery,
} from '@/modules/iam/presentation/dtos/req/subscription-request.dto';
import { Prisma } from '@internal/rbac/client';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PostgresAdapter) { }

  async cursorPagination(pageOptions: CursorSubscriptionsQuery) {
    try {
      const { data = [], paginated } = await cursorHelper<
        Prisma.SubscriptionGetPayload<{}>
      >({
        query: this.prisma.subscription,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

      return {
        data: data.map((item) => SubscriptionMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async paginate(pageOptions: PaginateSubscriptionsQuery) {
    try {
      const { data = [], paginated } = await paginateHelper<
        Prisma.SubscriptionGetPayload<{}>
      >({
        query: this.prisma.subscription,
        pageOptions,
      });

      return {
        data: data.map((item) => SubscriptionMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async create(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    try {
      const toPrisma = SubscriptionMapper.toPrismaCreate(subscription);
      const result = await this.prisma.subscription.create({ data: toPrisma });
      return SubscriptionMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async update(subscription: SubscriptionEntity): Promise<SubscriptionEntity> {
    try {
      const toPrisma = SubscriptionMapper.toPrismaUpdate(subscription);
      const result = await this.prisma.subscription.update({
        where: { id: subscription.id.value },
        data: toPrisma,
      });
      return SubscriptionMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.subscription.delete({ where: { id } });
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    try {
      const result = await this.prisma.subscription.findUnique({ where: { id } });
      if (!result) return null;
      return SubscriptionMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findBySlug(slug: string): Promise<SubscriptionEntity | null> {
    try {
      const result = await this.prisma.subscription.findUnique({
        where: { slug },
      });
      if (!result) return null;
      return SubscriptionMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    try {
      const results = await this.prisma.subscription.findMany();
      return results.map((result) => SubscriptionMapper.toDomain(result));
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
}
