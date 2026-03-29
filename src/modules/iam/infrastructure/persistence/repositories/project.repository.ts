import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';
import { IProjectRepository } from '@/modules/iam/domain/repositories/project.repository';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { ProjectMapper } from '../mappers/project.mapper';

export class ProjectRepository implements IProjectRepository {
  constructor(private readonly rbacDBService: PrismaAdapter) {}

  async create(project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrisma(project);
    const prj = await this.rbacDBService.project.create({
      data: toPrisma,
    });
    return ProjectMapper.toDomain(prj);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findFirst({
      where: { id },
    });
    if (!prj) {
      return null;
    }
    return ProjectMapper.toDomain(prj);
  }

  async findBySlug(
    slug: string,
    organization_id: string,
  ): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findUnique({
      where: { slug, organization_id },
    });

    if (!prj) return null;
    return ProjectMapper.toDomain(prj);
  }

  async update(id: string, project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrisma(project);
    const prj = await this.rbacDBService.project.update({
      where: { id },
      data: toPrisma,
    });
    return ProjectMapper.toDomain(prj);
  }

  async delete(id: string): Promise<void> {
    await this.rbacDBService.project.delete({ where: { id } });
  }

  async findOneByFeatureId(featureId: string): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findFirst({
      where: { features: { some: { id: featureId } } },
    });
    if (!prj) {
      return null;
    }
    return ProjectMapper.toDomain(prj);
  }
}
