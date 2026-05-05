import { AccessControlStatus } from "@/common/enum";
import { StaffBaseProps, Staffs } from "@/modules/iam/domain/entities/staffs.entity";
import { Prisma, Staff as PrismaStaffs } from "@internal/rbac/client";
import { Attributes } from "@/modules/iam/domain/vo/attributes.vo";
import { IEntityID } from "@/shared/domain/entities/base.entity";

export class StaffMapper {
    static toDomain(props: PrismaStaffs): Staffs {
        const id: IEntityID<string> = {
            value: props.id,
            _id: props.id,
            get: () => props.id,
        };
        return Staffs.create({
            id,
            status: props.status as AccessControlStatus,
            created_at: props.created_at,
            updated_at: props.updated_at,
            created_by: props.created_by ?? undefined,
            updated_by: props.updated_by ?? undefined,
            context_attributes: props.context_attributes ? Attributes.create(props.context_attributes) : undefined,
            user_id: props.user_id,
            organization_id: props.organization_id,
            department_id: props.department_id ?? undefined,
        });
    }

    static toPrisma(props: Staffs): PrismaStaffs {
        return {
            id: props.id.value,
            status: props.status,
            created_at: props.createdAt,
            updated_at: props.updatedAt,
            created_by: props.createdBy ?? null,
            updated_by: props.updatedBy ?? null,
            context_attributes: props.attributes?.value ?? null,
            user_id: props.userId,
            organization_id: props.orgId,
            department_id: props.departmentId ?? null,
        };
    }

    static toCreateInput(props: Staffs): Prisma.StaffCreateInput {
        return {
            user: {
                connect: {
                    id: props.userId
                }
            },
            organization: {
                connect: {
                    id: props.orgId
                }
            },
            created_by_user: {
                connect: {
                    id: props.createdBy
                }
            },
            status: props.status,
            created_at: props.createdAt,
            updated_at: props.updatedAt,
            updated_by: props.updatedBy ?? null,
            context_attributes: props.attributes?.value as Prisma.JsonObject,
            department: props.departmentId ? {
                connect: {
                    id: props.departmentId
                }
            } : undefined,
        };
    }

    static toUpdateInput(props: Staffs): Prisma.StaffUpdateInput {
        return {
            status: props.status,
            updated_at: props.updatedAt,
            updated_by: props.updatedBy ?? null,
            context_attributes: props.attributes?.value as Prisma.JsonObject,
            department: props.departmentId ? {
                connect: {
                    id: props.departmentId
                }
            } : undefined,
        };
    }
}
