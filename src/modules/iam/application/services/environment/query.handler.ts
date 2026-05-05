import { Inject, Injectable } from '@nestjs/common';
import { ENVIRONMENT_REPO, IEnvironmentRepository } from '@/modules/iam/domain/repositories/evironment.repository';
import { EnvironmentEntity } from '@/modules/iam/domain/entities/environment.entity';
import { CursorEnvironmentsQuery, PaginateEnvironmentsQuery } from '@/modules/iam/presentation/dtos/req/environment-request.dto';
import { PaginateEnvironmentsResponseDto } from '@/modules/iam/presentation/dtos/res/environment-response.dto';
import { EnvironmentMapper } from '@/modules/iam/infrastructure/persistence/mappers/environment.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class EnvironmentQueryHandler {
  constructor(
    @Inject(ENVIRONMENT_REPO)
    private readonly environmentRepo: IEnvironmentRepository,
  ) { }

  async findById(id: string): Promise<EnvironmentEntity | null> {
    return await this.environmentRepo.findById(id);
  }

  async findBySlug(slug: string): Promise<EnvironmentEntity | null> {
    return await this.environmentRepo.findBySlug(slug);
  }

  async findAll(): Promise<EnvironmentEntity[]> {
    return await this.environmentRepo.findAll();
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginateEnvironmentsQuery): Promise<PaginateEnvironmentsResponseDto> {
    const result = await this.environmentRepo.paginate(query);
    return {
      data: result.data.map((item) => EnvironmentMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorEnvironmentsQuery) {
    return await this.environmentRepo.cursorPagination(query);
  }
}
