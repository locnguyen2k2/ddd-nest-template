import { Inject, Injectable } from '@nestjs/common';
import { ATTRIBUTE_REPO, IAttributeRepository } from '@/modules/iam/domain/repositories/attribute.repository';
import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';

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
}
