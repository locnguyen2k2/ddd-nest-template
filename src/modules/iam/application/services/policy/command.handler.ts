import { Inject, Injectable } from '@nestjs/common';
import { IPolicyRepository, POLICY_REPO } from '@/modules/iam/domain/repositories/policy.repository';
import { CreatePolicyArgs, UpdatePolicyArgs, DeletePolicyArgs } from '../../dtos/commands/policy-cmd.dto';
import { PolicyEntity } from '@/modules/iam/domain/entities/policy.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { IEntityID } from '@/shared/domain/entities/base.entity';

@Injectable()
export class PolicyCommandHandler {
  constructor(
    @Inject(POLICY_REPO)
    private readonly policyRepo: IPolicyRepository,
  ) { }

  async handleCreatePolicy(command: CreatePolicyArgs): Promise<PolicyEntity> {
    const id = uuidv7();
    const entityId: IEntityID<string> = {
      value: id,
      _id: id,
      get: () => id,
    };

    const policy = PolicyEntity.create({
      id: entityId,
      name: command.name,
      description: command.description,
      effect: command.effect,
      action: command.action,
      resource: command.resource,
      condition: command.condition,
      organization_id: command.organizationId,
    });

    return await this.policyRepo.create(policy);
  }

  async handleUpdatePolicy(command: UpdatePolicyArgs): Promise<PolicyEntity> {
    const existingPolicy = await this.policyRepo.findById(command.id);
    if (!existingPolicy) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Policy with id '${command.id}' not found`);
    }

    if (existingPolicy.organizationId !== command.organizationId) {
      throw new BusinessException(ErrorEnum.ACCESS_DENIED, `Policy does not belong to your organization`);
    }

    existingPolicy.update({
      name: command.name,
      description: command.description,
      effect: command.effect,
      action: command.action,
      resource: command.resource,
      condition: command.condition,
    });

    return await this.policyRepo.update(command.id, existingPolicy);
  }

  async handleDeletePolicy(command: DeletePolicyArgs): Promise<void> {
    const existingPolicy = await this.policyRepo.findById(command.id);
    if (!existingPolicy) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Policy with id '${command.id}' not found`);
    }

    if (existingPolicy.organizationId !== command.organizationId) {
      throw new BusinessException(ErrorEnum.ACCESS_DENIED, `Policy does not belong to your organization`);
    }

    await this.policyRepo.delete(command.id);
  }
}
