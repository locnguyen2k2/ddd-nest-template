import { AttributeEntity } from '@/modules/iam/domain/entities/attribute.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Attributes as PrismaAttributes, Prisma } from '@internal/rbac/client';
import { AttributeResponseDto } from '@/modules/iam/presentation/dtos/res/attribute-response.dto';

export class AttributeMapper {
  static toDomain(props: PrismaAttributes): AttributeEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return AttributeEntity.create({
      id: id,
      entity_type: props.entity_type,
      key: props.key,
      data_type: props.data_type,
      description: props.description,
    });
  }

  static toPrisma(props: AttributeEntity): PrismaAttributes {
    return {
      id: props.id.value,
      entity_type: props.entity_type,
      key: props.key,
      data_type: props.data_type,
      description: props.description,
    };
  }

  static toPrismaCreate(attribute: AttributeEntity): Prisma.AttributesCreateInput {
    return {
      id: attribute.id.value,
      entity_type: attribute.entity_type,
      key: attribute.key,
      data_type: attribute.data_type,
      description: attribute.description,
    };
  }

  static toPrismaUpdate(attribute: AttributeEntity): Prisma.AttributesUpdateInput {
    return {
      entity_type: attribute.entity_type,
      key: attribute.key,
      data_type: attribute.data_type,
      description: attribute.description,
    };
  }

  static toResponseDto(attribute: AttributeEntity): AttributeResponseDto {
    return new AttributeResponseDto(
      attribute.id.value,
      attribute.entity_type,
      attribute.key,
      attribute.data_type,
      attribute.description,
    );
  }
}
