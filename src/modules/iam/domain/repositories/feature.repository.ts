import { Feature } from "../entities/feature.entity";

export const FEATURE_REPO = Symbol('FEATURE_REPO');
export interface IFeatureRepository {
    findOneById(id: string): Promise<Feature | null>;
    findOneBySlug(slug: string): Promise<Feature | null>;
    findAll(): Promise<Feature[]>;
    create(data: any): Promise<Feature>;
    update(id: string, data: any): Promise<Feature>;
    delete(id: string): Promise<void>;
}
