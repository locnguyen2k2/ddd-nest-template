import { Inject, Injectable } from '@nestjs/common';
import { DEPARTMENT_REPO, IDepartmentRepository } from '@/modules/iam/domain/repositories/department.repository';
import { Department } from '@/modules/iam/domain/entities/department.entity';
import {
  GetDepartmentByIdQuery,
  GetDepartmentsByOrgIdQuery,
  GetDepartmentBySlugQuery,
} from '../../dtos/queries/department-query.dto';

@Injectable()
export class DepartmentQueryHandler {
  constructor(
    @Inject(DEPARTMENT_REPO)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async handleGetDepartmentById(query: GetDepartmentByIdQuery): Promise<Department | null> {
    return await this.departmentRepository.findById(query.id);
  }

  async handleGetDepartmentBySlug(query: GetDepartmentBySlugQuery): Promise<Department | null> {
    return await this.departmentRepository.findBySlug(query.slug, query.organization_id);
  }

  async handleGetDepartmentsByOrgId(query: GetDepartmentsByOrgIdQuery): Promise<Department[]> {
    return await this.departmentRepository.findByOrgId(query.organization_id);
  }
}
