import { AttributeEntity } from '../entities/attribute.entity';
import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';

export const ATTRIBUTE_REPO = 'ATTRIBUTE_REPOSITORY';

export interface IAttributeRepository
  extends IPaginate<AttributeEntity>, ICursor<AttributeEntity> {
  create(attribute: AttributeEntity): Promise<AttributeEntity>;
  update(attribute: AttributeEntity): Promise<AttributeEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AttributeEntity | null>;
  findByEntityTypeAndKey(
    entityType: string,
    key: string,
  ): Promise<AttributeEntity | null>;
  findAll(): Promise<AttributeEntity[]>;
  findByEntityType(entityType: string): Promise<AttributeEntity[]>;
}
