import { IRoleRepository, ROLE_REPO } from "@/modules/iam/domain/repositories/role.entity";
import { Injectable } from "@nestjs/common";
import { RoleEntity } from "@/modules/iam/domain/entities/role.entity";
import { RoleMapper } from "../mappers/role.mapper";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";

@Injectable()
export class RoleRepository implements IRoleRepository {
    constructor(private readonly rbacDBService: PrismaService) { }

    async findById(id: string): Promise<RoleEntity | null> {
        const prismaRole = await this.rbacDBService.role.findUnique({
            where: { id }
        });

        return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
    }

    async findBySlug(slug: string): Promise<RoleEntity | null> {
        const prismaRole = await this.rbacDBService.role.findUnique({
            where: { slug }
        });

        return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
    }

    async findAll(): Promise<RoleEntity[]> {
        const prismaRoles = await this.rbacDBService.role.findMany();
        return prismaRoles.map(role => RoleMapper.toDomain(role));
    }

    async create(role: RoleEntity): Promise<RoleEntity> {
        const prismaData = RoleMapper.toPrisma(role);
        const createdRole = await this.rbacDBService.role.create({
            data: prismaData
        });

        return RoleMapper.toDomain(createdRole);
    }

    async update(id: string, role: RoleEntity): Promise<RoleEntity> {
        const prismaData = RoleMapper.toPrismaUpdate(role);
        const updatedRole = await this.rbacDBService.role.update({
            where: { id },
            data: prismaData
        });

        return RoleMapper.toDomain(updatedRole);
    }

    async delete(id: string): Promise<void> {
        await this.rbacDBService.role.delete({
            where: { id }
        });
    }
}