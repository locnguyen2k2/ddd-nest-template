import { Injectable, Inject } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { CreateFeatureArgs, UpdateFeatureArgs, DeleteFeatureArgs } from '@/modules/iam/application/dtos/commands/feature-cmd.dto';
import { FEATURE_REPO } from '@/modules/iam/domain/repositories/feature.repository';

@Injectable()
export class FeatureCommandHandler {
    constructor(@Inject(FEATURE_REPO) private readonly featureRepository: IFeatureRepository) { }

    async handleCreateFeature(command: CreateFeatureArgs): Promise<Feature> {
        const existingFeature = await this.featureRepository.findOneBySlug(command.slug);
        if (existingFeature) {
            throw new Error(`Feature with slug '${command.slug}' already exists`);
        }

        const featureId = {
            value: crypto.randomUUID(),
            _id: crypto.randomUUID(),
            get: () => crypto.randomUUID()
        };
        const slug = Slug.create(command.slug);

        const feature = Feature.create({
            id: featureId,
            name: command.name,
            slug: slug,
            description: command.description,
        });

        return await this.featureRepository.create(feature);
    }

    async handleUpdateFeature(command: UpdateFeatureArgs): Promise<Feature> {
        const existingFeature = await this.featureRepository.findOneById(command.id);
        if (!existingFeature) {
            throw new Error(`Feature with id '${command.id}' not found`);
        }

        if (command.slug && command.slug !== existingFeature.getSlug().value) {
            const slugConflict = await this.featureRepository.findOneBySlug(command.slug);
            if (slugConflict) {
                throw new Error(`Feature with slug '${command.slug}' already exists`);
            }
        }

        const updateProps: any = {};
        if (command.name !== undefined) updateProps.name = command.name;
        if (command.slug !== undefined) updateProps.slug = Slug.create(command.slug);
        if (command.description !== undefined) updateProps.description = command.description;

        existingFeature.update(updateProps);

        return await this.featureRepository.update(command.id, existingFeature);
    }

    async handleDeleteFeature(command: DeleteFeatureArgs): Promise<void> {
        const existingFeature = await this.featureRepository.findOneById(command.id);
        if (!existingFeature) {
            throw new Error(`Feature with id '${command.id}' not found`);
        }

        existingFeature.delete();

        await this.featureRepository.delete(command.id);
    }
}
