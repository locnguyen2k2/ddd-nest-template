import { Injectable } from '@nestjs/common';
import { IAttributeRepository } from '@/modules/iam/domain/repositories/attribute.repository';
import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { AttributeMapper } from '../../../../iam/infrastructure/persistence/mappers/attribute.mapper';

@Injectable()
export class AttributeRepository implements IAttributeRepository {
  constructor(private readonly prisma: PrismaAdapter) { }

  async create(attribute: AttributeEntity): Promise<AttributeEntity> {
    const toPrisma = AttributeMapper.toPrismaCreate(attribute);
    const result = await this.prisma.attributes.create({ data: toPrisma });
    return AttributeMapper.toDomain(result);
  }

  async update(attribute: AttributeEntity): Promise<AttributeEntity> {
    const toPrisma = AttributeMapper.toPrismaUpdate(attribute);
    const result = await this.prisma.attributes.update({
      where: { id: attribute.id.value },
      data: toPrisma,
    });
    return AttributeMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attributes.delete({ where: { id } });
  }

  async findById(id: string): Promise<AttributeEntity | null> {
    const result = await this.prisma.attributes.findUnique({ where: { id } });
    if (!result) return null;
    return AttributeMapper.toDomain(result);
  }

  async findByEntityTypeAndKey(entityType: string, key: string): Promise<AttributeEntity | null> {
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
  }

  async findAll(): Promise<AttributeEntity[]> {
    const results = await this.prisma.attributes.findMany();
    return results.map((result) => AttributeMapper.toDomain(result));
  }

  async findByEntityType(entityType: string): Promise<AttributeEntity[]> {
    const results = await this.prisma.attributes.findMany({
      where: { entity_type: entityType },
    });
    return results.map((result) => AttributeMapper.toDomain(result));
  }
}
