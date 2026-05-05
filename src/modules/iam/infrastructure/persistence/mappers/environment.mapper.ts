import { EnvironmentEntity } from '@/modules/iam/domain/entities/environment.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Environment as PrismaEnvironment, Prisma } from '@internal/rbac/client';
import { EnvironmentResponseDto } from '@/modules/iam/presentation/dtos/res/environment-response.dto';

export class EnvironmentMapper {
  static toDomain(props: PrismaEnvironment): EnvironmentEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return EnvironmentEntity.create({
      id: id,
      name: props.name,
      slug: props.slug,
      description: props.description,
    });
  }

  static toPrisma(props: EnvironmentEntity): PrismaEnvironment {
    return {
      id: props.id.value,
      name: props.name,
      slug: props.slug,
      description: props.description,
      created_at: props.created_at!,
      updated_at: props.updated_at || new Date(),
    };
  }

  static toPrismaCreate(environment: EnvironmentEntity): Prisma.EnvironmentCreateInput {
    return {
      id: environment.id.value,
      name: environment.name,
      slug: environment.slug,
      description: environment.description,
      created_at: environment.created_at!,
      updated_at: environment.updated_at!,
    };
  }

  static toPrismaUpdate(environment: EnvironmentEntity): Prisma.EnvironmentUpdateInput {
    return {
      name: environment.name,
      slug: environment.slug,
      description: environment.description,
      created_at: environment.created_at!,
      updated_at: environment.updated_at!,
    };
  }

  static toResponseDto(environment: EnvironmentEntity): EnvironmentResponseDto {
    return new EnvironmentResponseDto(
      environment.id.value,
      environment.name,
      environment.slug,
      environment.description,
    );
  }
}
