import { IPermissionRepository } from "@/modules/iam/domain/repositories/permission.repository";
import { PermissionEntity } from "@/modules/iam/domain/entities/permission.entity";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { PermissionMapper } from "../mappers/permission.mapper";
import { Logger } from "@nestjs/common";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";

export class PermissionRepository implements IPermissionRepository {
    private readonly logger = new Logger(PermissionRepository.name);
    constructor(private readonly rbacDBService: PrismaService) { }

    @LogExecutionTime()
    async create(permission: PermissionEntity): Promise<PermissionEntity | null> {
        const permissionPrisma = await this.rbacDBService.permission.create({
            data: {
                name: permission.name,
                slug: permission.slug,
                description: permission.description,
            },
        });
        return permissionPrisma ? PermissionMapper.toDomain(permissionPrisma) : null;
    }
    @LogExecutionTime()
    async findById(id: string): Promise<PermissionEntity | null> {
        const found = await this.rbacDBService.permission.findUnique({
            where: { id },
        });
        if (!found) return null;
        return PermissionMapper.toDomain(found);
    }
    @LogExecutionTime()
    async findBySlug(slug: string): Promise<PermissionEntity | null> {
        const found = await this.rbacDBService.permission.findUnique({
            where: { slug },
        });
        if (!found) return null;
        return PermissionMapper.toDomain(found);
    }
    @LogExecutionTime()
    async findAll(): Promise<PermissionEntity[]> {
        const found = await this.rbacDBService.permission.findMany();
        return found.map(PermissionMapper.toDomain);
    }
    @LogExecutionTime()
    async update(id: string, permission: PermissionEntity): Promise<PermissionEntity> {
        const updated = await this.rbacDBService.permission.update({
            where: { id },
            data: {
                name: permission.name,
                slug: permission.slug,
                description: permission.description,
            },
        });
        return PermissionMapper.toDomain(updated);
    }
    @LogExecutionTime()
    async delete(id: string): Promise<void> {
        await this.rbacDBService.permission.delete({
            where: { id },
        });
    }
}
