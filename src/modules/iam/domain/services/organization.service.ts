import { Inject, Injectable } from "@nestjs/common";
import { IOrganizationRepository, ORGANIZATION_REPO } from "../repositories/organization.repository";
import { IRoleRepository, ROLE_REPO } from "../repositories/role.repository";
import { BusinessException } from "@/common/http/business-exception";
import { ErrorEnum } from "@/common/exception.enum";

@Injectable()
export class OrgSerevice {
    constructor(@Inject(ORGANIZATION_REPO) private readonly orgRepo: IOrganizationRepository,
        @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository) {
    }

    async validateAssignRoleToUser(userId: string, roleId: string, orgId: string): Promise<boolean> {
        try {
            const [orgHasUser, orgHasRole, existingOrg, userHasRole] = await Promise.all([
                this.orgRepo.organizationHasUser(orgId, userId),
                this.orgRepo.organizationHasRole(orgId, roleId),
                this.orgRepo.findById(orgId),
                this.roleRepo.userHasRole(userId, roleId, orgId)
            ])

            switch (true) {
                case !orgHasUser:
                    throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'User not found in organization')
                case !orgHasRole:
                    throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Role not found in organization')
                case !existingOrg:
                    throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization not found')
                case userHasRole:
                    throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'User already has this role')
                default:
                    return true
            }
        } catch (e: any) {
            console.dir(e);
            return false;
        }
    }
}
