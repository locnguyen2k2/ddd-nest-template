import { Inject, Injectable } from '@nestjs/common';
import { DEPARTMENT_REPO, IDepartmentRepository } from '@/modules/iam/domain/repositories/department.repository';
import { Department } from '@/modules/iam/domain/entities/department.entity';
import {
  GetDepartmentByIdQuery,
  GetDepartmentsByOrgIdQuery,
  GetDepartmentBySlugQuery,
} from '../../dtos/queries/department-query.dto';
import { CursorDepartmentsQuery, PaginateDepartmentsQuery } from '@/modules/iam/presentation/dtos/req/department.dto';
import { DepartmentMapper } from '@/modules/iam/infrastructure/persistence/mappers/department.mapper';
import { SortableFieldEnum, SortedEnum } from '@/common/pagination';
import { cursorHelper, paginateHelper } from '@/common/pagination';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { PaginateDepartmentsResponseDto } from '@/modules/iam/presentation/dtos/res/department-response.dto';

@Injectable()
export class DepartmentQueryHandler {
  constructor(
    @Inject(DEPARTMENT_REPO)
    private readonly departmentRepository: IDepartmentRepository,
  ) { }

  @LogExecutionTime()
  async handlePaginate(query: PaginateDepartmentsQuery): Promise<PaginateDepartmentsResponseDto> {
    const result = await this.departmentRepository.paginate(query);
    return {
      data: result.data.map((item) => DepartmentMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorDepartmentsQuery) {
    return await this.departmentRepository.cursorPagination(query);
  }

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
