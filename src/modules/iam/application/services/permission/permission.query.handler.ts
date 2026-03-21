import { Inject } from "@nestjs/common";
import { IPermissionRepository, PERMISSION_REPO } from "@/modules/iam/domain/repositories/permission.repository";

export class PermissionQueryHandler {
    constructor(@Inject(PERMISSION_REPO) private readonly permissionRepository: IPermissionRepository) { }

    handleGetById(id: string) {
        return this.permissionRepository.findById(id);
    }

    handleGetBySlug(slug: string) {
        return this.permissionRepository.findBySlug(slug);
    }
}
