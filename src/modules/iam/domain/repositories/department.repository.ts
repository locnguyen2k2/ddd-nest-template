import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';
import { Department } from '../entities/department.entity';

export const DEPARTMENT_REPO = Symbol('DEPARTMENT_REPO');
export interface IDepartmentRepository
  extends IPaginate<Department>, ICursor<Department> {
  findById(id: string): Promise<Department | null>;
  findBySlug(slug: string, orgId: string): Promise<Department | null>;
  findByOrgId(orgId: string): Promise<Department[]>;
  create(data: Department): Promise<Department>;
  update(id: string, data: Department): Promise<Department>;
  delete(id: string): Promise<void>;
}
