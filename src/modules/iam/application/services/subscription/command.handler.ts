import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPO,
  ISubscriptionRepository,
} from '@/modules/iam/domain/repositories/subscription.repository';
import { SubscriptionEntity } from '@/modules/iam/domain/entities/subscription.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import {
  CreateSubscriptionCommand,
  UpdateSubscriptionCommand,
  DeleteSubscriptionCommand,
} from '../../dtos/commands/subscription-cmd.dto';

@Injectable()
export class SubscriptionCommandHandler {
  constructor(
    @Inject(SUBSCRIPTION_REPO)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async handleCreate(
    command: CreateSubscriptionCommand,
  ): Promise<SubscriptionEntity> {
    const existing = await this.subscriptionRepo.findBySlug(command.slug);
    if (existing) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Subscription with slug '${command.slug}' already exists`,
      );
    }

    const id = uuidv7();
    const subscriptionId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const subscription = SubscriptionEntity.create({
      id: subscriptionId,
      name: command.name,
      slug: command.slug,
      description: command.description,
    });

    return await this.subscriptionRepo.create(subscription);
  }

  async handleUpdate(
    command: UpdateSubscriptionCommand,
  ): Promise<SubscriptionEntity> {
    const existing = await this.subscriptionRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Subscription with id '${command.id}' not found`,
      );
    }

    const slug = command.slug ?? existing.slug;

    if (command.slug !== undefined) {
      const conflict = await this.subscriptionRepo.findBySlug(slug);
      if (conflict && conflict.id.value !== command.id) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Subscription with slug '${slug}' already exists`,
        );
      }
    }

    const updatedSubscription = SubscriptionEntity.create({
      id: existing.id,
      name: command.name ?? existing.name,
      slug: slug,
      description:
        command.description !== undefined
          ? command.description
          : existing.description,
    });

    return await this.subscriptionRepo.update(updatedSubscription);
  }

  async handleDelete(command: DeleteSubscriptionCommand): Promise<void> {
    const existing = await this.subscriptionRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Subscription with id '${command.id}' not found`,
      );
    }
    await this.subscriptionRepo.delete(command.id);
  }
}
