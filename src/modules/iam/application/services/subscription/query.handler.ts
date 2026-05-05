import { Inject, Injectable } from '@nestjs/common';
import { SUBSCRIPTION_REPO, ISubscriptionRepository } from '@/modules/iam/domain/repositories/subscription.repository';
import { SubscriptionEntity } from '@/modules/iam/domain/entities/subscription.entity';
import { CursorSubscriptionsQuery, PaginateSubscriptionsQuery } from '@/modules/iam/presentation/dtos/req/subscription-request.dto';
import { PaginateSubscriptionsResponseDto } from '@/modules/iam/presentation/dtos/res/subscription-response.dto';
import { SubscriptionMapper } from '@/modules/iam/infrastructure/persistence/mappers/subscription.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class SubscriptionQueryHandler {
  constructor(
    @Inject(SUBSCRIPTION_REPO)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) { }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    return await this.subscriptionRepo.findById(id);
  }

  async findBySlug(slug: string): Promise<SubscriptionEntity | null> {
    return await this.subscriptionRepo.findBySlug(slug);
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepo.findAll();
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginateSubscriptionsQuery): Promise<PaginateSubscriptionsResponseDto> {
    const result = await this.subscriptionRepo.paginate(query);
    return {
      data: result.data.map((item) => SubscriptionMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorSubscriptionsQuery) {
    return await this.subscriptionRepo.cursorPagination(query);
  }
}
