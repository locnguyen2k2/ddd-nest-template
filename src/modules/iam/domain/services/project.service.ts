import { IProjectRepository } from '../repositories/project.repository';

export class ProjectDomainService {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async projectIsExisted(slug: string, orgID: string): Promise<boolean> {
    const isExisted = await this.projectRepo.findBySlug(slug, orgID);
    if (isExisted) return true;
    return false;
  }
}
