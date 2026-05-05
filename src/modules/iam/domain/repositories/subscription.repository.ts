import { IPaginate, ICursor } from '@/shared/domain/repositories/base.repository';
import { SubscriptionEntity } from '../entities/subscription.entity';

export const SUBSCRIPTION_REPO = 'SUBSCRIPTION_REPOSITORY';

export interface ISubscriptionRepository extends IPaginate<SubscriptionEntity>, ICursor<SubscriptionEntity> {
    create(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
    update(subscription: SubscriptionEntity): Promise<SubscriptionEntity>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<SubscriptionEntity | null>;
    findBySlug(slug: string): Promise<SubscriptionEntity | null>;
    findAll(): Promise<SubscriptionEntity[]>;
}
