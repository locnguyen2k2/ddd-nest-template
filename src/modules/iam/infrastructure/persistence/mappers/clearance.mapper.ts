import { ClearanceEntity } from '@/modules/iam/domain/entities/clearance.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Clearance as PrismaClearance, Prisma } from '@internal/rbac/client';
import { ClearanceResponseDto } from '@/modules/iam/presentation/dtos/res/clearance-response.dto';

export class ClearanceMapper {
  static toDomain(props: PrismaClearance): ClearanceEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return ClearanceEntity.create({
      id: id,
      name: props.name,
      level: props.level,
      description: props.description,
    });
  }

  static toPrisma(props: ClearanceEntity): PrismaClearance {
    return {
      id: props.id.value,
      name: props.name,
      level: props.level,
      description: props.description,
      created_at: props.created_at!,
      updated_at: props.updated_at || new Date(),
    };
  }

  static toPrismaCreate(clearance: ClearanceEntity): Prisma.ClearanceCreateInput {
    return {
      id: clearance.id.value,
      name: clearance.name,
      level: clearance.level,
      description: clearance.description,
      created_at: clearance.created_at!,
      updated_at: clearance.updated_at!,
    };
  }

  static toPrismaUpdate(clearance: ClearanceEntity): Prisma.ClearanceUpdateInput {
    return {
      name: clearance.name,
      level: clearance.level,
      description: clearance.description,
      created_at: clearance.created_at!,
      updated_at: clearance.updated_at!,
    };
  }

  static toResponseDto(clearance: ClearanceEntity): ClearanceResponseDto {
    return new ClearanceResponseDto(
      clearance.id.value,
      clearance.name,
      clearance.level,
      clearance.description,
    );
  }
}
