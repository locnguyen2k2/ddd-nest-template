import { Injectable } from "@nestjs/common";
import { IOrganizationRepository } from "../../../domain/repositories/organization.repository";
import { Organization } from "../../../domain/entities/organization.entity";
import { OrganizationMapper } from "../mappers/organization.mapper";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
    constructor(private readonly rbacDBService: PrismaService) { }

    async findById(id: string): Promise<Organization | null> {
        const prismaOrganization = await this.rbacDBService.organization.findUnique({
            where: { id }
        });

        return prismaOrganization ? OrganizationMapper.toDomain(prismaOrganization) : null;
    }

    async findBySlug(slug: string): Promise<Organization | null> {
        const prismaOrganization = await this.rbacDBService.organization.findUnique({
            where: { slug }
        });

        return prismaOrganization ? OrganizationMapper.toDomain(prismaOrganization) : null;
    }

    async findAll(): Promise<Organization[]> {
        const prismaOrganizations = await this.rbacDBService.organization.findMany();
        return prismaOrganizations.map(org => OrganizationMapper.toDomain(org));
    }

    async create(organization: Organization): Promise<Organization> {
        const prismaData = OrganizationMapper.toPrisma(organization);
        const createdOrganization = await this.rbacDBService.organization.create({
            data: prismaData
        });

        return OrganizationMapper.toDomain(createdOrganization);
    }

    async update(id: string, organization: Organization): Promise<Organization> {
        const prismaData = OrganizationMapper.toPrismaUpdate(organization);
        const updatedOrganization = await this.rbacDBService.organization.update({
            where: { id },
            data: prismaData
        });

        return OrganizationMapper.toDomain(updatedOrganization);
    }

    async delete(id: string): Promise<void> {
        await this.rbacDBService.organization.delete({
            where: { id }
        });
    }
}
