import {
  CreateProjectArgs,
  UpdateProjectArgs,
  DeleteProjectArgs,
} from '../../dtos/commands/project-cmd.dto';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';
import { uuidv7 } from 'uuidv7';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Inject } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPO,
} from '@/modules/iam/domain/repositories/project.repository';
import { IPayload } from '@/modules/iam/domain/services/auth.service';

export class ProjectCmdHandler {
  constructor(
    @Inject(PROJECT_REPO) private readonly pojectRepo: IProjectRepository,
  ) {}

  async handleCreate(user: IPayload, props: CreateProjectArgs) {
    const isExisted = await this.pojectRepo.findBySlug(
      props.slug,
      props.organization_id,
    );
    if (isExisted) throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS);
    const id = uuidv7();
    const entityId: IEntityID<string> = {
      value: id,
      _id: id,
      get: () => id,
    };
    const project = ProjectEntity.create({
      ...props,
      id: entityId,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: user.sub,
      updated_by: user.sub,
    });

    return await this.pojectRepo.create(project);
  }

  async handleUpdate(id: string, props: UpdateProjectArgs) {
    const isExisted = await this.pojectRepo.findById(id);
    if (!isExisted) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);

    if (isExisted.organizationID !== props.organization_id) {
      throw new BusinessException(
        ErrorEnum.ACCESS_DENIED,
        'Project does not belong to your organization',
      );
    }

    isExisted.update({ ...props });

    return await this.pojectRepo.update(id, isExisted);
  }

  async handleDelete(props: DeleteProjectArgs) {
    const isExisted = await this.pojectRepo.findById(props.id);
    if (!isExisted) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);

    if (isExisted.organizationID !== props.organization_id) {
      throw new BusinessException(
        ErrorEnum.ACCESS_DENIED,
        'Project does not belong to your organization',
      );
    }

    return await this.pojectRepo.delete(props.id);
  }
}
