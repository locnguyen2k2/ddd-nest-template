import { AccessControlStatus } from "@/common/enum";
import { DepartmentBaseProps, Department } from "@/modules/iam/domain/entities/department.entity";
import { Prisma, Department as PrismaDepartment } from "@internal/rbac/client";
import { IEntityID } from "@/shared/domain/entities/base.entity";
import { DepartmentResponseDto } from "@/modules/iam/presentation/dtos/res/department-response.dto";
import { Attributes } from "@/modules/iam/domain/vo/attributes.vo";

export class DepartmentMapper {
    static toDomain(props: PrismaDepartment): Department {
        const id: IEntityID<string> = {
            value: props.id,
            _id: props.id,
            get: () => props.id,
        };
        return Department.create({
            id,
            created_at: props.created_at,
            updated_at: props.updated_at,
            name: props.name,
            slug: props.slug,
            organization_id: props.organization_id,
            attributes: Attributes.create(props.attributes)
        });
    }

    static toPrisma(props: Department): PrismaDepartment {
        return {    
            id: props.id.value,
            created_at: props.created_at,
            updated_at: props.updated_at,
            name: props.name,
            slug: props.slug,
            organization_id: props.org_id,
            attributes: props.attributes.value as Prisma.JsonObject
        };
    }

    static toCreateInput(props: DepartmentBaseProps): Prisma.DepartmentCreateInput {
        return {
            slug: props.slug,
            name: props.name,
            organization: {
                connect: {
                    id: props.organization_id
                }
            },
            created_at: props.created_at,
            updated_at: props.updated_at,
        };
    }

    static toUpdateInput(props: DepartmentBaseProps): Prisma.DepartmentUpdateInput {
        return {
            name: props.name,
            created_at: props.created_at,
            updated_at: props.updated_at,
        };
    }

    static toResponseDto(props: Department): DepartmentResponseDto {
        return {
            id: props.id.value,
            name: props.name,
            slug: props.slug,
            organization_id: props.org_id,
            created_at: props.created_at,
            updated_at: props.updated_at,
        };
    }
}
