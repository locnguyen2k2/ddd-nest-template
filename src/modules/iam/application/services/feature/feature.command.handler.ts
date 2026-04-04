import { Injectable, Inject } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import {
  CreateFeatureArgs,
  UpdateFeatureArgs,
  DeleteFeatureArgs,
} from '@/modules/iam/application/dtos/commands/feature-cmd.dto';
import { FEATURE_REPO } from '@/modules/iam/domain/repositories/feature.repository';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { PROJECT_REPO } from '@/modules/iam/domain/repositories/project.repository';
import { IProjectRepository } from '@/modules/iam/domain/repositories/project.repository';

@Injectable()
export class FeatureCommandHandler {
  constructor(
    @Inject(FEATURE_REPO)
    private readonly featureRepository: IFeatureRepository,
    @Inject(PROJECT_REPO)
    private readonly projectRepository: IProjectRepository,
  ) { }

  async handleCreateFeature(command: CreateFeatureArgs): Promise<Feature> {
    const [existingFeature, existingProject] = await Promise.all([
      this.featureRepository.findOneBySlug(
        command.slug,
        command.project_id,
      ),
      this.projectRepository.findById(command.project_id),
    ]);

    switch (true) {
      case !!existingFeature:
        throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS, 'Feature');
      case !existingProject:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Project');
    }

    const id = uuidv7();
    const featureId = {
      value: id,
      _id: id,
      get: () => id,
    };
    const slug = Slug.create(command.slug);

    const feature = Feature.create({
      id: featureId,
      name: command.name,
      slug: slug,
      description: command.description,
      project_id: command.project_id,
      created_by: undefined,
      updated_by: undefined,
    });

    return await this.featureRepository.create(feature);
  }

  async handleUpdateFeature(command: UpdateFeatureArgs): Promise<Feature> {
    const existingFeature = await this.featureRepository.findOneById(
      command.id,
    );
    if (!existingFeature) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Feature');
    }

    if (command.slug && command.slug !== existingFeature.slug.value) {
      const slugConflict = await this.featureRepository.findOneBySlug(
        command.slug,
        command.organization_id,
      );
      if (slugConflict) {
        throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS, 'Feature');
      }
    }

    const updateProps: any = {};
    if (command.name !== undefined) updateProps.name = command.name;
    if (command.slug !== undefined)
      updateProps.slug = Slug.create(command.slug);
    if (command.description !== undefined)
      updateProps.description = command.description;

    existingFeature.update(updateProps);

    return await this.featureRepository.update(command.id, existingFeature);
  }

  async handleDeleteFeature(command: DeleteFeatureArgs): Promise<void> {
    const existingFeature = await this.featureRepository.findOneById(
      command.id,
    );
    if (!existingFeature) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Feature');
    }

    existingFeature.delete();

    await this.featureRepository.delete(command.id);
  }
}
