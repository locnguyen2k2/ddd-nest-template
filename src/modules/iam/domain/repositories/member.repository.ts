import {
    IPaginate,
    ICursor,
} from '@/shared/domain/repositories/base.repository';
import { Member } from '../entities/member.entity';

export const MEMBER_REPO = Symbol('MEMBER_REPO');
export interface IMemberRepository
    extends IPaginate<Member>, ICursor<Member> {
    findById(id: string): Promise<Member | null>;
    findByStaffId(staffId: string): Promise<Member | null>;
    findByProjectId(projectId: string): Promise<Member[]>;
    create(data: Member): Promise<Member>;
    update(id: string, data: Member): Promise<Member>;
    delete(id: string): Promise<void>;
}
