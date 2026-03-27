import { IRoleRepository, ROLE_REPO } from "@/modules/iam/domain/repositories/role.repository";
import { Injectable } from "@nestjs/common";
import { RoleEntity } from "@/modules/iam/domain/entities/role.entity";
import { RoleMapper } from "../mappers/role.mapper";
import { PrismaAdapter } from "@/shared/infrastructure/adapters/prisma.adapter";
import { Logger } from "@nestjs/common";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from "@/common/pagination";
import { CursorRolesQuery, PaginateRolesQuery } from "@/modules/iam/application/dtos/queries/role-query.dto";
import { AccessControlStatus, Prisma } from "@prisma/client";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";

@Injectable()
export class RoleRepository implements IRoleRepository {
    private readonly logger = new Logger(RoleRepository.name);
    constructor(private readonly rbacDBService: PrismaAdapter) { }

    @LogExecutionTime()
    async createRFP(role_id: string, feature_id: string, permission_id: string): Promise<void> {
        try {
            await this.rbacDBService.roleFeaturePermission.create({
                data: {
                    role_id,
                    feature_id,
                    permission_id,
                    status: AccessControlStatus.ACTIVE
                }
            });
        } catch (e: any) {
            this.logger.error(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE)
        }
    }

    @LogExecutionTime()
    async deleteRFP(role_id: string, feature_id: string, permission_id: string): Promise<void> {
        try {
            await this.rbacDBService.roleFeaturePermission.delete({
                where: {
                    role_id_feature_id_permission_id: {
                        role_id,
                        feature_id,
                        permission_id
                    }
                }
            });
        } catch (e: any) {
            this.logger.error(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE)
        }
    }

    @LogExecutionTime()
    async hasPermission(role_chain_ids: string[], feature_id: string, permission_id: string): Promise<boolean> {
        try {
            const result = await this.rbacDBService.$queryRaw`
                SELECT 1
                FROM "RoleFeaturePermission" rfp
                WHERE rfp.role_id = ANY(${role_chain_ids}::uuid[])
                    AND rfp.feature_id = ${feature_id}
                    AND rfp.permission_id = ${permission_id}
                    AND rfp.status = 'ACTIVE'
                LIMIT 1
                `;

            return Array.isArray(result) && result.length > 0;
        } catch (e: any) {
            this.logger.error(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async getRoleChain(role_id: string, depth: number = 10): Promise<string[]> {
        try {
            const role = await this.rbacDBService.$queryRaw`
                WITH RECURSIVE role_chain AS (
                    SELECT id, parent_role_id, 1 as depth
                    FROM "Role"
                    WHERE id = ${role_id}

                    UNION ALL

                    SELECT r.id, r.parent_role_id, rc.depth + 1
                    FROM "Role" r
                    INNER JOIN role_chain rc ON r.id = rc.parent_role_id
                    WHERE rc.depth < ${depth}
                )
                SELECT id FROM role_chain;`;
            if (!role || (Array.isArray(role) && role.length === 0)) {
                throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
            }
            return (role as any[]).map((r: any) => r.id) as string[];
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async userHasRole(user_id: string, role_id: string, organization_id: string): Promise<boolean> {
        try {
            const isEXisted = await this.rbacDBService.userOrganizationRole.findUnique({
                where: {
                    user_id_organization_id_role_id: {
                        user_id,
                        role_id,
                        organization_id,
                    }
                }
            });
            return !!isEXisted;
        } catch (e: any) {
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async paginate(pageOptions: PaginateRolesQuery) {
        try {
            const { data = [], paginated } = await paginateHelper<Prisma.RoleCreateInput>({
                query: this.rbacDBService.role,
                pageOptions,
            });

            return {
                data: data,
                paginated
            };
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
        }
    }

    @LogExecutionTime()
    async cursorPagination(pageOptions: CursorRolesQuery) {
        try {
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
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async findById(id: string): Promise<RoleEntity | null> {
        try {
            const prismaRole = await this.rbacDBService.role.findUnique({
                where: { id }
            });
            return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
        } catch (e: any) {
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async findBySlug(slug: string, organization_id: string): Promise<RoleEntity | null> {
        try {
            const prismaRole = await this.rbacDBService.role.findFirst({
                where: { slug, organization_id }
            });
            return prismaRole ? RoleMapper.toDomain(prismaRole) : null;
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async findAll(): Promise<RoleEntity[]> {
        try {
            const prismaRoles = await this.rbacDBService.role.findMany();
            return prismaRoles.map(role => RoleMapper.toDomain(role));
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async create(role: RoleEntity): Promise<RoleEntity> {
        try {
            const prismaData = RoleMapper.toPrisma(role);
            const createdRole = await this.rbacDBService.role.create({
                data: prismaData
            });
            return RoleMapper.toDomain(createdRole);
        } catch (e: any) {
            this.logger.debug(e)
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE)
        }
    }

    @LogExecutionTime()
    async update(id: string, role: RoleEntity): Promise<RoleEntity> {
        try {
            const prismaData = RoleMapper.toPrismaUpdate(role);
            const updatedRole = await this.rbacDBService.role.update({
                where: { id },
                data: prismaData
            });

            return RoleMapper.toDomain(updatedRole);
        } catch (e: any) {
            this.logger.debug(e)
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY)
        }
    }

    @LogExecutionTime()
    async delete(id: string): Promise<void> {
        try {
            await this.rbacDBService.role.delete({
                where: { id }
            });
        } catch (e: any) {
            this.logger.debug(e);
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE)
        }
    }
}