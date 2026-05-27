import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import {
  GetOrganizationByIdQuery,
  GetOrganizationBySlugQuery,
} from '../../dtos/queries/organization-query.dto';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import {
  CursorOrganizationsQuery,
  PaginateOrganizationsQuery,
} from '@/modules/iam/presentation/dtos/req/organization.dto';
import { Period } from '@/common/enum';
import { StatsPercentInfo } from '@/common/interfaces/stats.interface';

@Injectable()
export class OrganizationQueryHandler {
  constructor(
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepository: IOrganizationRepository,
  ) { }

  private readonly percentGrowthCalc = {
    [Period.MONTH]: async (user_id: string) =>
      this.organizationRepository.percentByMonth(user_id),
  };

  async percentGrowth(user_id: string, period?: string): Promise<number> {
    return await this.percentGrowthCalc[period || Period.MONTH](user_id);
  }

  @LogExecutionTime()
  async organizationHasUser(orgId: string, userId: string): Promise<boolean> {
    return await this.organizationRepository.organizationHasUser(orgId, userId);
  }

  @LogExecutionTime()
  async handlePercentByMonth(
    userId: string,
    period: string,
  ): Promise<StatsPercentInfo> {
    let result: StatsPercentInfo = {
      percent_growth: 0,
      total: 0,
      current: 0,
      title: 'Organization Growth',
    };
    try {
      const [beforeCount, currentCount] = await Promise.all([
        this.organizationRepository.countBeforeByMonth(userId),
        this.organizationRepository.countByMonth(userId),
      ]);

      if (beforeCount === 0) {
        result.percent_growth = 100;
      } else {
        result.percent_growth = (currentCount - beforeCount) / beforeCount;
      }
      result.total = beforeCount + currentCount;
      result.current = currentCount;
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginateOrganizationsQuery) {
    return await this.organizationRepository.paginate(query);
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorOrganizationsQuery) {
    return await this.organizationRepository.cursorPagination(query);
  }

  @LogExecutionTime()
  async handleCursorOrganizationsByJoiner(
    query: CursorOrganizationsQuery,
    joinerId: string,
  ) {
    try {
      return await this.organizationRepository.cursorPaginationByJoiner(
        query,
        joinerId,
      );
    } catch (error) {
      console.error('Error listing organizations by joiner:', error);
    }
    return null;
  }

  async handleGetById(
    query: GetOrganizationByIdQuery,
  ): Promise<Organization | null> {
    return await this.organizationRepository.findById(query.id);
  }

  async handleGetOrganizationBySlug(
    query: GetOrganizationBySlugQuery,
  ): Promise<Organization | null> {
    return await this.organizationRepository.findBySlug(query.slug);
  }

  async handleListOrganizationsByJoiner(
    query: PaginateOrganizationsQuery,
    joinerId: string,
  ) {
    try {
      return await this.organizationRepository.handleListOrganizationsByJoiner(
        query,
        joinerId,
      );
    } catch (error) {
      console.error('Error listing organizations by joiner:', error);
    }
    return null;
  }
}
