import { CreateProjectArgs, UpdateProjectArgs } from "../../dtos/commands/project-cmd.dto";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";
import { ProjectEntity } from "@/modules/iam/domain/entities/project.entity";
import { uuidv7 } from "uuidv7";
import { IEntityID } from "@/shared/domain/entities/base.entity";
import { Inject } from "@nestjs/common";
import { IProjectRepository, PROJECT_REPO } from "@/modules/iam/domain/repositories/project.repository";

export class ProjectCmdHandler {
    constructor(@Inject(PROJECT_REPO) private readonly pojectRepo: IProjectRepository) { }

    async handleCreate(props: CreateProjectArgs) {
        const isExisted = await this.pojectRepo.findBySlug(props.slug, props.organization_id);
        if (isExisted) throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS);
        const _id = uuidv7();
        const id: IEntityID<string> = { _id, value: _id, get: () => _id };
        const project = ProjectEntity.create({ ...props, id, created_at: new Date(), updated_at: new Date() });

        return await this.pojectRepo.create(project);
    }

    async handleUpdate(id: string, props: UpdateProjectArgs) {
        const isExisted = await this.pojectRepo.findById(id);
        if (!isExisted) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
        isExisted.update({ ...props });

        return await this.pojectRepo.update(id, isExisted);
    }
}
