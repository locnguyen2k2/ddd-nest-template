import { Inject, Injectable } from '@nestjs/common';
import { DEPARTMENT_REPO, IDepartmentRepository } from '@/modules/iam/domain/repositories/department.repository';
import { CreateDepartmentArgs, UpdateDepartmentArgs, DeleteDepartmentArgs } from '../../dtos/commands/department-cmd.dto';
import { Department } from '@/modules/iam/domain/entities/department.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';

@Injectable()
export class DepartmentCommandHandler {
  constructor(
    @Inject(DEPARTMENT_REPO)
    private readonly departmentRepo: IDepartmentRepository,
  ) { }

  async handleCreateDepartment(command: CreateDepartmentArgs): Promise<Department> {
    const existing = await this.departmentRepo.findBySlug(command.slug, command.organization_id);
    if (existing) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Department with slug '${command.slug}' already exists in this organization`,
      );
    }

    const id = uuidv7();
    const departmentId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const department = Department.create({
      id: departmentId,
      name: command.name,
      slug: command.slug,
      organization_id: command.organization_id,
      attributes: Attributes.create(command.attributes),
    });

    return await this.departmentRepo.create(department);
  }

  async handleUpdateDepartment(command: UpdateDepartmentArgs): Promise<Department> {
    const existing = await this.departmentRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Department with id '${command.id}' not found`,
      );
    }

    existing.update({
      name: command.name ?? existing.name,
      slug: command.slug ?? existing.slug,
    });

    if (command.slug) {
      const isExisted = await this.departmentRepo.findBySlug(command.slug, existing.org_id);
      if (isExisted && isExisted.id.value !== existing.id.value) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Department with slug '${command.slug}' already exists in this organization`,
        );
      }
    }

    return await this.departmentRepo.update(command.id, existing);
  }

  async handleDeleteDepartment(command: DeleteDepartmentArgs): Promise<void> {
    const existing = await this.departmentRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Department with id '${command.id}' not found`,
      );
    }
    await this.departmentRepo.delete(command.id);
  }
}
