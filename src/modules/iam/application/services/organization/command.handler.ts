import { Inject, Injectable } from "@nestjs/common";
import { ORGANIZATION_REPO } from "@/modules/iam/domain/repositories/organization.repository";
import { CreateOrganizationArgs, UpdateOrganizationArgs, DeleteOrganizationArgs } from "../../dtos/commands/organization-cmd.dto";
import { Organization } from "@/modules/iam/domain/entities/organization.entity";
import { Slug } from "@/modules/iam/domain/vo/slug.vo";
import { IOrganizationRepository } from "@/modules/iam/domain/repositories/organization.repository";
import { uuidv7 } from 'uuidv7';

@Injectable()
export class OrganizationCommandHandler {
    constructor(@Inject(ORGANIZATION_REPO) private readonly organizationRepo: IOrganizationRepository) { }

    async handleCreateOrganization(command: CreateOrganizationArgs): Promise<Organization> {
        const existingOrganization = await this.organizationRepo.findBySlug(command.slug);
        if (existingOrganization) {
            throw new Error(`Organization with slug '${command.slug}' already exists`);
        }

        const id = uuidv7();
        const organizationId = {
            value: id,
            _id: id,
            get: () => id
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

    async handleUpdateOrganization(command: UpdateOrganizationArgs): Promise<Organization> {
        const existingOrganization = await this.organizationRepo.findById(command.id);
        if (!existingOrganization) {
            throw new Error(`Organization with id '${command.id}' not found`);
        }

        if (command.slug && command.slug !== existingOrganization.getSlug().value) {
            const slugConflict = await this.organizationRepo.findBySlug(command.slug);
            if (slugConflict) {
                throw new Error(`Organization with slug '${command.slug}' already exists`);
            }
        }

        const updateProps: any = {};
        if (command.name !== undefined) updateProps.name = command.name;
        if (command.slug !== undefined) updateProps.slug = Slug.create(command.slug);
        if (command.description !== undefined) updateProps.description = command.description;

        existingOrganization.update(updateProps);

        return await this.organizationRepo.update(command.id, existingOrganization);
    }

    async handleDeleteOrganization(command: DeleteOrganizationArgs): Promise<void> {
        const existingOrganization = await this.organizationRepo.findById(command.id);
        if (!existingOrganization) {
            throw new Error(`Organization with id '${command.id}' not found`);
        }

        existingOrganization.delete();

        await this.organizationRepo.delete(command.id);
    }
}
