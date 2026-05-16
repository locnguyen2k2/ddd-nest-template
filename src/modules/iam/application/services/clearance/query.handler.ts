import { Inject, Injectable } from '@nestjs/common';
import {
  CLEARANCE_REPO,
  IClearanceRepository,
} from '@/modules/iam/domain/repositories/clearance.repository';
import { ClearanceEntity } from '@/modules/iam/domain/entities/clearance.entity';
import {
  CursorClearancesQuery,
  PaginateClearancesQuery,
} from '@/modules/iam/presentation/dtos/req/clearance-request.dto';
import { PaginateClearancesResponseDto } from '@/modules/iam/presentation/dtos/res/clearance-response.dto';
import { ClearanceMapper } from '@/modules/iam/infrastructure/persistence/mappers/clearance.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class ClearanceQueryHandler {
  constructor(
    @Inject(CLEARANCE_REPO)
    private readonly clearanceRepo: IClearanceRepository,
  ) {}

  async findById(id: string): Promise<ClearanceEntity | null> {
    return await this.clearanceRepo.findById(id);
  }

  async findByLevel(level: number): Promise<ClearanceEntity | null> {
    return await this.clearanceRepo.findByLevel(level);
  }

  async findAll(): Promise<ClearanceEntity[]> {
    return await this.clearanceRepo.findAll();
  }

  @LogExecutionTime()
  async handlePaginate(
    query: PaginateClearancesQuery,
  ): Promise<PaginateClearancesResponseDto> {
    const result = await this.clearanceRepo.paginate(query);
    return {
      data: result.data.map((item) => ClearanceMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorClearancesQuery) {
    return await this.clearanceRepo.cursorPagination(query);
  }
}
