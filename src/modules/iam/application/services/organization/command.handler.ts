import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import {
  CreateOrganizationArgs,
  UpdateOrganizationArgs,
  DeleteOrganizationArgs,
  UpdateStaffAttributesArgs,
} from '../../dtos/commands/organization-cmd.dto';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { IPayload } from '@/modules/iam/domain/services/auth.service';

@Injectable()
export class OrganizationCommandHandler {
  constructor(
    @Inject(ORGANIZATION_REPO)
    private readonly organizationRepo: IOrganizationRepository,
  ) { }

  async handleCreateOrganization(
    user: IPayload,
    command: CreateOrganizationArgs,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationRepo.findBySlug(
      command.slug,
    );
    if (existingOrganization) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Organization with slug '${command.slug}' already exists`,
      );
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
      created_by: user.sub,
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
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Organization with id '${command.id}' not found`,
      );
    }

    if (command.slug && command.slug !== existingOrganization.slug().value) {
      const slugConflict = await this.organizationRepo.findBySlug(command.slug);
      if (slugConflict) {
        throw new BusinessException(
          ErrorEnum.REQUEST_VALIDATION_ERROR,
          `Organization with slug '${command.slug}' already exists`,
        );
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
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Organization with id '${command.id}' not found`,
      );
    }

    existingOrganization.delete();

    await this.organizationRepo.delete(command.id);
  }

  async handleJoinOrganization(command: {
    userId: string;
    organizationId: string;
  }): Promise<void> {
    const alreadyJoined = await this.organizationRepo.organizationHasUser(
      command.organizationId,
      command.userId,
    );
    if (alreadyJoined) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `User with id '${command.userId}' already joined organization '${command.organizationId}'`,
      );
    }
    return await this.organizationRepo.assignUser(
      command.organizationId,
      command.userId,
    );
  }

  async handleUpdateUserAttributes(
    command: UpdateStaffAttributesArgs,
  ): Promise<void> {
    const hasAccess = await this.organizationRepo.organizationHasUser(
      command.organizationId,
      command.userId,
    );
    if (!hasAccess) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `User with id '${command.userId}' is not a member of organization '${command.organizationId}'`,
      );
    }
    return await this.organizationRepo.updateUserAttributes(
      command.organizationId,
      command.userId,
      command.attributes,
    );
  }
}
