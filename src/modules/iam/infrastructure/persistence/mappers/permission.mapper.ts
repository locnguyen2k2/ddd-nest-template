import { PermissionAction } from '@/common/enum';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma } from '@prisma/client';
import { uuidv7 } from 'uuidv7';

export class PermissionMapper {
  static toDomain(
    permissionPrisma: Prisma.PermissionCreateInput,
  ): PermissionEntity {
    const value = permissionPrisma.id || uuidv7();
    const permissionID: IEntityID<string> = {
      value,
      _id: value,
      get: () => permissionPrisma.action,
    };

    return PermissionEntity.create({
      id: permissionID,
      name: permissionPrisma.name,
      action: permissionPrisma.action as PermissionAction,
      description: permissionPrisma.description || undefined,
      created_at: (permissionPrisma.created_at as Date) || undefined,
      updated_at: (permissionPrisma.updated_at as Date) || undefined,
    });
  }

  static toPrisma(permission: PermissionEntity): Prisma.PermissionCreateInput {
    return {
      id: permission.id.value,
      name: permission.name,
      action: permission.action,
      description: permission.description,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static toPrismaUpdate(permission: PermissionEntity): any {
    return {
      name: permission.name,
      action: permission.action,
      description: permission.description,
      updated_at: new Date(),
    };
  }

  static toResponseDto(permission: PermissionEntity): any {
    return {
      id: permission.id.value,
      name: permission.name,
      action: permission.action,
      description: permission.description,
      created_at: permission.createdAt(),
      updated_at: permission.updatedAt(),
    };
  }
}
