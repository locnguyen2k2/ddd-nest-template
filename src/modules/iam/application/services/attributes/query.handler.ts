import { Inject, Injectable } from '@nestjs/common';
import { ATTRIBUTE_REPO, IAttributeRepository } from '@/modules/iam/domain/repositories/attribute.repository';
import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';
import { CursorAttributesQuery, PaginateAttributesQuery } from '@/modules/iam/presentation/dtos/req/attribute-request.dto';
import { PaginateAttributesResponseDto } from '@/modules/iam/presentation/dtos/res/attribute-response.dto';
import { AttributeMapper } from '@/modules/iam/infrastructure/persistence/mappers/attribute.mapper';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class AttributeQueryHandler {
  constructor(
    @Inject(ATTRIBUTE_REPO)
    private readonly attributeRepo: IAttributeRepository,
  ) { }

  async findById(id: string): Promise<AttributeEntity | null> {
    return await this.attributeRepo.findById(id);
  }

  async findAll(): Promise<AttributeEntity[]> {
    return await this.attributeRepo.findAll();
  }

  async findByEntityType(entityType: string): Promise<AttributeEntity[]> {
    return await this.attributeRepo.findByEntityType(entityType);
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginateAttributesQuery): Promise<PaginateAttributesResponseDto> {
    const result = await this.attributeRepo.paginate(query);
    return {
      data: result.data.map((item) => AttributeMapper.toResponseDto(item)),
      paginated: result.paginated,
    };
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorAttributesQuery) {
    return await this.attributeRepo.cursorPagination(query);
  }
}
