import { AccessControlStatus, PermissionAction } from '@/common/enum';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';
import { PermissionResponseDto } from '@/modules/iam/presentation/dtos/res/permission-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma } from '@internal/rbac/client';
import { uuidv7 } from 'uuidv7';

export class PermissionMapper {
  static toDomainWithRFPs(
    permissionPrisma: Prisma.PermissionGetPayload<{ include: { role_feature_permissions: true } }>,
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
      created_at: permissionPrisma.created_at,
      updated_at: permissionPrisma.updated_at,
      created_by: permissionPrisma.created_by,
      updated_by: permissionPrisma.updated_by,
      rfps: permissionPrisma.role_feature_permissions.map(fp => ({
        ...fp,
        role_id: fp.role_id,
        feature_id: fp.feature_id,
        permission_id: fp.permission_id,
        created_at: fp.created_at || new Date(),
        updated_at: fp.updated_at || new Date(),
        created_by: fp.created_by || undefined,
        updated_by: fp.updated_by || undefined,
        status: fp.status.toLocaleLowerCase() as AccessControlStatus
      })),
    });
  }

  static toDomain(
    permissionPrisma: Prisma.PermissionGetPayload<{}>,
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
      created_at: permissionPrisma.created_at,
      updated_at: permissionPrisma.updated_at,
      created_by: permissionPrisma.created_by,
      updated_by: permissionPrisma.updated_by,
    });
  }

  static toPrisma(permission: PermissionEntity): Prisma.PermissionGetPayload<{}> {
    return {
      id: permission.id.value,
      name: permission.name,
      action: permission.action,
      created_by: permission.createdBy || null,
      updated_by: permission.updatedBy || null,
      description: permission.description,
      created_at: permission.createdAt || new Date(),
      updated_at: permission.updatedAt || new Date(),
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

  static toResponseDto(permission: PermissionEntity): PermissionResponseDto {
    return {
      id: permission.id.value,
      name: permission.name,
      action: permission.action,
      description: permission.description,
      created_at: permission.createdAt,
      updated_at: permission.updatedAt,
      created_by: permission.createdBy || undefined,
      updated_by: permission.updatedBy || undefined,
    };
  }
}
