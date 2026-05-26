import { Inject, Injectable } from '@nestjs/common';
import {
  IPolicyRepository,
  POLICY_REPO,
} from '@/modules/iam/domain/repositories/policy.repository';
import {
  CursorPoliciesQuery,
  PaginatePoliciesQuery,
} from '@/modules/iam/presentation/dtos/req/policy.dto';
import { PaginatePoliciesResponseDto } from '@/modules/iam/presentation/dtos/res/policy-response.dto';
import { PolicyMapper } from '@/modules/iam/infrastructure/persistence/mappers/policy.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class PolicyQueryHandler {
  constructor(
    @Inject(POLICY_REPO)
    private readonly policyRepo: IPolicyRepository,
  ) {}

  @LogExecutionTime()
  async handlePaginate(
    query: PaginatePoliciesQuery,
  ): Promise<PaginatePoliciesResponseDto> {
    const result = await this.policyRepo.paginate(query);
    return {
      data: result.data.map((item) => PolicyMapper.toResponse(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorPoliciesQuery) {
    return await this.policyRepo.cursorPagination(query);
  }
}
