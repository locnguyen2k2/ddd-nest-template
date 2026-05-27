import { Injectable } from '@nestjs/common';
import { IAttributeRepository } from '@/modules/iam/domain/repositories/attribute.repository';
import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { AttributeMapper } from '../../../../iam/infrastructure/persistence/mappers/attribute.mapper';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorAttributesQuery,
  PaginateAttributesQuery,
} from '@/modules/iam/presentation/dtos/req/attribute-request.dto';
import { Prisma } from '@internal/rbac/client';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class AttributeRepository implements IAttributeRepository {
  constructor(private readonly prisma: PostgresAdapter) { }

  async cursorPagination(pageOptions: CursorAttributesQuery) {
    try {
      const { data = [], paginated } = await cursorHelper<
        Prisma.AttributesGetPayload<{}>
      >({
        query: this.prisma.attributes,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

      return {
        data: data.map((item) => AttributeMapper.toDomain(item)),
        paginated,
      };
    } catch (error: any) {
      throw new BusinessException(`400|${error?.message}`);
    }
  }

  async paginate(pageOptions: PaginateAttributesQuery) {
    try {
      const { data = [], paginated } = await paginateHelper<
        Prisma.AttributesGetPayload<{}>
      >({
        query: this.prisma.attributes,
        pageOptions,
      });

      return {
        data: data.map((item) => AttributeMapper.toDomain(item)),
        paginated,
      };
    } catch (error: any) {
      throw new BusinessException(`400|${error?.message}`);
    }
  }

  async create(attribute: AttributeEntity): Promise<AttributeEntity> {
    try {
      const toPrisma = AttributeMapper.toPrismaCreate(attribute);
      const result = await this.prisma.attributes.create({ data: toPrisma });
      return AttributeMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async update(attribute: AttributeEntity): Promise<AttributeEntity> {
    try {
      const toPrisma = AttributeMapper.toPrismaUpdate(attribute);
      const result = await this.prisma.attributes.update({
        where: { id: attribute.id.value },
        data: toPrisma,
      });
      return AttributeMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.attributes.delete({ where: { id } });
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findById(id: string): Promise<AttributeEntity | null> {
    try {
      const result = await this.prisma.attributes.findUnique({ where: { id } });
      if (!result) return null;
      return AttributeMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findByEntityTypeAndKey(
    entityType: string,
    key: string,
  ): Promise<AttributeEntity | null> {
    try {
      const result = await this.prisma.attributes.findUnique({
        where: {
          entity_type_key: {
            entity_type: entityType,
            key: key,
          },
        },
      });
      if (!result) return null;
      return AttributeMapper.toDomain(result);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findAll(): Promise<AttributeEntity[]> {
    try {
      const results = await this.prisma.attributes.findMany();
      return results.map((result) => AttributeMapper.toDomain(result));
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findByEntityType(entityType: string): Promise<AttributeEntity[]> {
    try {
      const results = await this.prisma.attributes.findMany({
        where: { entity_type: entityType },
      });
      return results.map((result) => AttributeMapper.toDomain(result));
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
}
