import { Inject, Injectable } from '@nestjs/common';
import {
  ATTRIBUTE_REPO,
  IAttributeRepository,
} from '@/modules/iam/domain/repositories/attribute.repository';
import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import {
  CreateAttributeCommand,
  UpdateAttributeCommand,
  DeleteAttributeCommand,
} from '../../dtos/commands/atttribute-cmd.dto';

@Injectable()
export class AttributeCommandHandler {
  constructor(
    @Inject(ATTRIBUTE_REPO)
    private readonly attributeRepo: IAttributeRepository,
  ) {}

  async handleCreate(
    command: CreateAttributeCommand,
  ): Promise<AttributeEntity> {
    const existing = await this.attributeRepo.findByEntityTypeAndKey(
      command.entity_type,
      command.key,
    );
    if (existing) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Attribute with key '${command.key}' already exists for entity type '${command.entity_type}'`,
      );
    }

    const id = uuidv7();
    const attributeId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const attribute = AttributeEntity.create({
      id: attributeId,
      entity_type: command.entity_type,
      key: command.key,
      data_type: command.data_type,
      description: command.description,
    });

    return await this.attributeRepo.create(attribute);
  }

  async handleUpdate(
    command: UpdateAttributeCommand,
  ): Promise<AttributeEntity> {
    const existing = await this.attributeRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Attribute with id '${command.id}' not found`,
      );
    }

    const entity_type = command.entity_type ?? existing.entity_type;
    const key = command.key ?? existing.key;

    if (command.entity_type || command.key) {
      const conflict = await this.attributeRepo.findByEntityTypeAndKey(
        entity_type,
        key,
      );
      if (conflict && conflict.id.value !== command.id) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Attribute with key '${key}' already exists for entity type '${entity_type}'`,
        );
      }
    }

    const updatedAttribute = AttributeEntity.create({
      id: existing.id,
      entity_type: entity_type,
      key: key,
      data_type: command.data_type ?? existing.data_type,
      description:
        command.description !== undefined
          ? command.description
          : existing.description,
    });

    return await this.attributeRepo.update(updatedAttribute);
  }

  async handleDelete(command: DeleteAttributeCommand): Promise<void> {
    const existing = await this.attributeRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Attribute with id '${command.id}' not found`,
      );
    }
    await this.attributeRepo.delete(command.id);
  }
}
