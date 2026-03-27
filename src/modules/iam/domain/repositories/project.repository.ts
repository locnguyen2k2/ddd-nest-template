import { ProjectEntity } from "../entities/project.entity";

export const PROJECT_REPO = 'PROJECT_REPOSITORY'
export interface IProjectRepository {
    create(project: ProjectEntity): Promise<ProjectEntity>;
    findById(id: string): Promise<ProjectEntity | null>;
    findOneByFeatureId(featureId: string): Promise<ProjectEntity | null>;
    findBySlug(slug: string, organization_id: string): Promise<ProjectEntity | null>;
    update(id: string, project: ProjectEntity): Promise<ProjectEntity>;
    delete(id: string): Promise<void>;
}