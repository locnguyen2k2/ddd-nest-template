import { RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';

export class RoleMapper {
    static toDomain(prismaRole: any): RoleEntity {
        const roleId: IEntityID<string> = {
            value: prismaRole.id,
            _id: prismaRole.id,
            get: () => prismaRole.id,
        };

        const slug = Slug.create(prismaRole.slug);

        return RoleEntity.create({
            id: roleId,
            name: prismaRole.name,
            slug: slug,
            description: prismaRole.description || undefined,
        });
    }

    static toPrisma(role: RoleEntity): any {
        return {
            id: role.id.value,
            name: role.getName(),
            slug: role.getSlug().value,
            description: role.getDescription(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static toPrismaUpdate(role: RoleEntity): any {
        return {
            name: role.getName(),
            slug: role.getSlug().value,
            description: role.getDescription(),
            updatedAt: new Date(),
        };
    }

    static toResponseDto(role: RoleEntity): any {
        return {
            id: role.id.value,
            name: role.getName(),
            slug: role.getSlug().value,
            description: role.getDescription(),
        };
    }
}
