import { Inject, Injectable } from '@nestjs/common';
import { MEMBER_REPO, IMemberRepository } from '@/modules/iam/domain/repositories/member.repository';
import { Member } from '@/modules/iam/domain/entities/member.entity';
import {
  GetMemberByIdQuery,
  GetMembersByProjectIdQuery,
  GetMemberByStaffIdQuery,
} from '../../dtos/queries/member-query.dto';

@Injectable()
export class MemberQueryHandler {
  constructor(
    @Inject(MEMBER_REPO)
    private readonly memberRepository: IMemberRepository,
  ) { }

  async handleGetMemberById(query: GetMemberByIdQuery): Promise<Member | null> {
    return await this.memberRepository.findById(query.id);
  }

  async handleGetMembersByProjectId(query: GetMembersByProjectIdQuery): Promise<Member[]> {
    return await this.memberRepository.findByProjectId(query.project_id);
  }

  async handleGetMemberByStaffId(query: GetMemberByStaffIdQuery): Promise<Member[]> {
    return await this.memberRepository.findByStaffId(query.staff_id);
  }
}
