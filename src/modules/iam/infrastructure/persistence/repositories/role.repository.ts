import { IRoleRepository, ROLE_REPO } from "@/modules/iam/domain/repositories/role.repository";
import { Injectable } from "@nestjs/common";
import { RoleEntity } from "@/modules/iam/domain/entities/role.entity";
import { RoleMapper } from "../mappers/role.mapper";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { Logger } from "@nestjs/common";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from "@/common/pagination";
import { CursorRolesQuery, PaginateRolesQuery } from "@/modules/iam/application/dtos/queries/role-query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class RoleRepository implements IRoleRepository {
    private readonly logger = new Logger(RoleRepository.name);
    constructor(private readonly rbacDBService: PrismaService) { }

    @LogExecutionTime()
    async paginate(pageOptions: PaginateRolesQuery) {
        const { data = [], paginated } = await paginateHelper<Prisma.RoleCreateInput>({
            query: this.rbacDBService.role,
            pageOptions,
        });

        return {
            data: data,
            paginated
        };
    }

    @LogExecutionTime()
    async cursorPagination(pageOptions: CursorRolesQuery) {
        const { data = [], paginated } = await cursorHelper<Prisma.RoleCreateInput>({
            query: this.rbacDBService.role,
            pageOptions,
            cursorField: SortableFieldEnum.CREATED_AT,
            orderDirection: SortedEnum.DESC,
        });

        return {
            data: data,
            paginated
        };
    }

    @LogExecutionTime()
    async findById(id: string): Promise<RoleEntity | null> {
        const prismaRole = await this.rbacDBService.role.findUnique({
            where: { id }
        });
        return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
    }

    @LogExecutionTime()
    async findBySlug(slug: string): Promise<RoleEntity | null> {
        const prismaRole = await this.rbacDBService.role.findUnique({
            where: { slug }
        });
        return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
    }

    @LogExecutionTime()
    async findAll(): Promise<RoleEntity[]> {
        const prismaRoles = await this.rbacDBService.role.findMany();
        return prismaRoles.map(role => RoleMapper.toDomain(role));
    }

    @LogExecutionTime()
    async create(role: RoleEntity): Promise<RoleEntity> {
        const prismaData = RoleMapper.toPrisma(role);
        const createdRole = await this.rbacDBService.role.create({
            data: prismaData
        });
        return RoleMapper.toDomain(createdRole);
    }

    @LogExecutionTime()
    async update(id: string, role: RoleEntity): Promise<RoleEntity> {
        const prismaData = RoleMapper.toPrismaUpdate(role);
        const updatedRole = await this.rbacDBService.role.update({
            where: { id },
            data: prismaData
        });

        return RoleMapper.toDomain(updatedRole);
    }

    @LogExecutionTime()
    async delete(id: string): Promise<void> {
        await this.rbacDBService.role.delete({
            where: { id }
        });
    }
}