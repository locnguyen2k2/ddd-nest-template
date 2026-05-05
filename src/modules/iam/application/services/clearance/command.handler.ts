import { Inject, Injectable } from '@nestjs/common';
import { CLEARANCE_REPO, IClearanceRepository } from '@/modules/iam/domain/repositories/clearance.repository';
import { ClearanceEntity } from '@/modules/iam/domain/entities/clearance.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { CreateClearanceCommand, UpdateClearanceCommand, DeleteClearanceCommand } from '../../dtos/commands/clearance-cmd.dto';

@Injectable()
export class ClearanceCommandHandler {
  constructor(
    @Inject(CLEARANCE_REPO)
    private readonly clearanceRepo: IClearanceRepository,
  ) { }

  async handleCreate(command: CreateClearanceCommand): Promise<ClearanceEntity> {
    const existing = await this.clearanceRepo.findByLevel(command.level);
    if (existing) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Clearance with level '${command.level}' already exists`,
      );
    }

    const id = uuidv7();
    const clearanceId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const clearance = ClearanceEntity.create({
      id: clearanceId,
      name: command.name,
      level: command.level,
      description: command.description,
    });

    return await this.clearanceRepo.create(clearance);
  }

  async handleUpdate(command: UpdateClearanceCommand): Promise<ClearanceEntity> {
    const existing = await this.clearanceRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Clearance with id '${command.id}' not found`,
      );
    }

    const level = command.level ?? existing.level;

    if (command.level !== undefined) {
      const conflict = await this.clearanceRepo.findByLevel(level);
      if (conflict && conflict.id.value !== command.id) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Clearance with level '${level}' already exists`,
        );
      }
    }

    const updatedClearance = ClearanceEntity.create({
      id: existing.id,
      name: command.name ?? existing.name,
      level: level,
      description: command.description !== undefined ? command.description : existing.description,
    });

    return await this.clearanceRepo.update(updatedClearance);
  }

  async handleDelete(command: DeleteClearanceCommand): Promise<void> {
    const existing = await this.clearanceRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Clearance with id '${command.id}' not found`,
      );
    }
    await this.clearanceRepo.delete(command.id);
  }
}
