import { ErrorEnum } from '@/common/exception.enum';
import { BusinessException } from '@/common/http/business-exception';
import {
  IProjectRepository,
  PROJECT_REPO,
} from '@/modules/iam/domain/repositories/project.repository';
import { Inject } from '@nestjs/common';

export class ProjectQueryHandler {
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
  ) {}

  async handlerGetByID(id: string) {
    const item = await this.projectRepo.findById(id);
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    return item;
  }

  async handlerGetProjectByFeatureId(featureId: string) {
    const item = await this.projectRepo.findOneByFeatureId(featureId);
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    return item;
  }
}
