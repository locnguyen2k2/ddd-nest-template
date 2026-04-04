import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import {
  CreateOrganizationArgs,
  UpdateOrganizationArgs,
  DeleteOrganizationArgs,
  AssignRoleToUserArgs,
} from '../../dtos/commands/organization-cmd.dto';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { OrgSerevice } from '@/modules/iam/domain/services/organization.service';
import { ErrorEnum } from '@/common/exception.enum';

@Injectable()
export class OrganizationCommandHandler {
  constructor(
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepo: IOrganizationRepository,
    private readonly orgService: OrgSerevice,
  ) { }

  async handleAssignRoleToUser(
    command: AssignRoleToUserArgs,
  ): Promise<void> {
    const isValid = await this.orgService.validateAssignRoleToUser(command.userId, command.roleId, command.orgId);
    if (!isValid) {
      throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, 'Invalid role, organization or user');
    }

    return await this.organizationRepo.assignRoleToUser(command.orgId, command.userId, command.roleId);
  }

  async handleCreateOrganization(
    command: CreateOrganizationArgs,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationRepo.findBySlug(
      command.slug,
    );
    if (existingOrganization) {
      throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, `Organization with slug '${command.slug}' already exists`);
    }

    const id = uuidv7();
    const organizationId = {
      value: id,
      _id: id,
      get: () => id,
    };
    const slug = Slug.create(command.slug);

    const organization = Organization.create({
      id: organizationId,
      name: command.name,
      slug: slug,
      description: command.description,
    });

    return await this.organizationRepo.create(organization);
  }

  async handleUpdateOrganization(
    command: UpdateOrganizationArgs,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationRepo.findById(
      command.id,
    );
    if (!existingOrganization) {
      throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, `Organization with id '${command.id}' not found`);
    }

    if (command.slug && command.slug !== existingOrganization.slug().value) {
      const slugConflict = await this.organizationRepo.findBySlug(command.slug);
      if (slugConflict) {
        throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, `Organization with slug '${command.slug}' already exists`);
      }
    }

    const updateProps: any = {};
    if (command.name !== undefined) updateProps.name = command.name;
    if (command.slug !== undefined)
      updateProps.slug = Slug.create(command.slug);
    if (command.description !== undefined)
      updateProps.description = command.description;

    existingOrganization.update(updateProps);

    return await this.organizationRepo.update(command.id, existingOrganization);
  }

  async handleDeleteOrganization(
    command: DeleteOrganizationArgs,
  ): Promise<void> {
    const existingOrganization = await this.organizationRepo.findById(
      command.id,
    );
    if (!existingOrganization) {
      throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, `Organization with id '${command.id}' not found`);
    }

    existingOrganization.delete();

    await this.organizationRepo.delete(command.id);
  }

  async handleJoinOrganization(
    command: { userId: string; organizationId: string },
  ): Promise<void> {
    const alreadyJoined = await this.organizationRepo.organizationHasUser(
      command.organizationId,
      command.userId,
    );
    if (alreadyJoined) {
      throw new BusinessException(ErrorEnum.REQUEST_VALIDATION_ERROR, `User with id '${command.userId}' already joined organization '${command.organizationId}'`);
    }
    return await this.organizationRepo.assignUser(
      command.organizationId,
      command.userId,
    );
  }
}
