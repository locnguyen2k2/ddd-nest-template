import { PermissionEntity } from "@/modules/iam/domain/entities/permission.entity";
import { IEntityID } from "@/shared/domain/entities/base.entity";

export class PermissionMapper {
    static toDomain(permissionPrisma: any): PermissionEntity {
        const permissionID: IEntityID<string> = {
            value: permissionPrisma.id,
            _id: permissionPrisma.id,
            get: () => permissionPrisma.id,
        };
        return PermissionEntity.create({
            id: permissionID,
            name: permissionPrisma.name,
            slug: permissionPrisma.slug,
            description: permissionPrisma.description,
        });
    }

    toPrisma(permission: PermissionEntity): any {
        return {
            id: permission.id.value,
            name: permission.name,
            slug: permission.slug,
            description: permission.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static toPrismaUpdate(permission: PermissionEntity): any {
        return {
            name: permission.name,
            slug: permission.slug,
            description: permission.description,
            updatedAt: new Date(),
        };
    }

    static toResponseDto(permission: PermissionEntity): any {
        return {
            id: permission.id.value,
            name: permission.name,
            slug: permission.slug,
            description: permission.description,
        };
    }
}
