import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { ProjectResponseDto } from '@/modules/iam/presentation/dtos/res/project-response.dto';
import { Project, Prisma } from '@internal/rbac/client';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';
import { DepartmentMapper } from './department.mapper';

export class ProjectMapper {
  static toDomain(prj: any): ProjectEntity {
    const id: IEntityID<string> = {
      value: prj.id,
      _id: prj.id,
      get: () => prj.id,
    };

    return ProjectEntity.create({
      id,
      name: prj.name,
      slug: prj.slug,
      description: prj.description || undefined,
      organization_id: prj.organization_id,
      created_at: prj.created_at,
      updated_at: prj.updated_at,
      created_by: prj.created_by || undefined,
      updated_by: prj.updated_by || undefined,
      attributes: Attributes.create(prj.attributes),
      department_id: prj.department_id || undefined,
      department: prj.department ? DepartmentMapper.toDomain(prj.department) : undefined,
    });
  }

  static toPrisma(prj: ProjectEntity): any {
    return {
      id: prj.id.value,
      name: prj.name,
      slug: prj.slug,
      description: prj.description,
      organization_id: prj.organizationID,
      created_at: prj.createdAt,
      updated_at: prj.updatedAt,
      created_by: prj.createdBy,
      updated_by: prj.updatedBy,
      attributes: prj.attributes.value as Prisma.JsonObject,
      department_id: prj.departmentID,
      department: prj.department ? DepartmentMapper.toPrisma(prj.department) : undefined,
    };
  }

  static toPrismaCreate(prj: ProjectEntity): Prisma.ProjectCreateInput {
    return {
      name: prj.name,
      slug: prj.slug,
      description: prj.description,
      organization: {
        connect: {
          id: prj.organizationID,
        },
      },
      created_at: prj.createdAt,
      updated_at: prj.updatedAt,
      created_by_user: {
        connect: {
          id: prj.createdBy || '',
        },
      },
      updated_by: prj.updatedBy || undefined,
      attributes: prj.attributes.value as Prisma.JsonObject,
    };
  }

  static toPrismaUpdate(prj: ProjectEntity): Prisma.ProjectUpdateInput {
    return {
      name: prj.name,
      slug: prj.slug,
      description: prj.description,
      organization: {
        connect: {
          id: prj.organizationID,
        },
      },
      updated_at: prj.updatedAt,
      updated_by: prj.updatedBy,
      attributes: prj.attributes.value as Prisma.JsonObject,
    };
  }

  static toResponseDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description || undefined,
      organization_id: project.organization_id,
      created_by: project.created_by || undefined,
      updated_by: project.updated_by || undefined,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  }
}
