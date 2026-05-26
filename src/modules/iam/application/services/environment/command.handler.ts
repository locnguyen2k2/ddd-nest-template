import { Inject, Injectable } from '@nestjs/common';
import {
  ENVIRONMENT_REPO,
  IEnvironmentRepository,
} from '@/modules/iam/domain/repositories/evironment.repository';
import { EnvironmentEntity } from '@/modules/iam/domain/entities/environment.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import {
  CreateEnvironmentCommand,
  UpdateEnvironmentCommand,
  DeleteEnvironmentCommand,
} from '../../dtos/commands/environment-cmd.dto';

@Injectable()
export class EnvironmentCommandHandler {
  constructor(
    @Inject(ENVIRONMENT_REPO)
    private readonly environmentRepo: IEnvironmentRepository,
  ) {}

  async handleCreate(
    command: CreateEnvironmentCommand,
  ): Promise<EnvironmentEntity> {
    const existing = await this.environmentRepo.findBySlug(command.slug);
    if (existing) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Environment with slug '${command.slug}' already exists`,
      );
    }

    const id = uuidv7();
    const environmentId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const environment = EnvironmentEntity.create({
      id: environmentId,
      name: command.name,
      slug: command.slug,
      description: command.description,
    });

    return await this.environmentRepo.create(environment);
  }

  async handleUpdate(
    command: UpdateEnvironmentCommand,
  ): Promise<EnvironmentEntity> {
    const existing = await this.environmentRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Environment with id '${command.id}' not found`,
      );
    }

    const slug = command.slug ?? existing.slug;

    if (command.slug !== undefined) {
      const conflict = await this.environmentRepo.findBySlug(slug);
      if (conflict && conflict.id.value !== command.id) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Environment with slug '${slug}' already exists`,
        );
      }
    }

    const updatedEnvironment = EnvironmentEntity.create({
      id: existing.id,
      name: command.name ?? existing.name,
      slug: slug,
      description:
        command.description !== undefined
          ? command.description
          : existing.description,
    });

    return await this.environmentRepo.update(updatedEnvironment);
  }

  async handleDelete(command: DeleteEnvironmentCommand): Promise<void> {
    const existing = await this.environmentRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Environment with id '${command.id}' not found`,
      );
    }
    await this.environmentRepo.delete(command.id);
  }
}
