import { AttributeEntity } from '../entities/attribute.entity';

export const ATTRIBUTE_REPO = 'ATTRIBUTE_REPOSITORY';

export interface IAttributeRepository {
  create(attribute: AttributeEntity): Promise<AttributeEntity>;
  update(attribute: AttributeEntity): Promise<AttributeEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AttributeEntity | null>;
  findByEntityTypeAndKey(entityType: string, key: string): Promise<AttributeEntity | null>;
  findAll(): Promise<AttributeEntity[]>;
  findByEntityType(entityType: string): Promise<AttributeEntity[]>;
}
