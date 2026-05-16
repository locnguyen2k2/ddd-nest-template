import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_REPO,
  IMemberRepository,
} from '@/modules/iam/domain/repositories/member.repository';
import {
  CreateMemberArgs,
  UpdateMemberArgs,
  DeleteMemberArgs,
} from '../../dtos/commands/member-cmd.dto';
import { Member } from '@/modules/iam/domain/entities/member.entity';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';

@Injectable()
export class MemberCommandHandler {
  constructor(
    @Inject(MEMBER_REPO)
    private readonly memberRepo: IMemberRepository,
  ) {}

  async handleCreateMember(command: CreateMemberArgs): Promise<Member> {
    const existing = await this.memberRepo.findByStaffId(command.staff_id);

    const existingInProject = existing.find(
      (m) => m.project_id === command.project_id,
    );
    if (existingInProject) {
      throw new BusinessException(
        ErrorEnum.REQUEST_VALIDATION_ERROR,
        `Staff with id '${command.staff_id}' is already a member of project '${command.project_id}'`,
      );
    }

    const id = uuidv7();
    const memberId = {
      value: id,
      _id: id,
      get: () => id,
    };

    const member = Member.create({
      id: memberId,
      staff_id: command.staff_id,
      project_id: command.project_id,
      status: command.status,
      attributes: Attributes.create(command.attributes),
    });

    return await this.memberRepo.create(member);
  }

  async handleUpdateMember(command: UpdateMemberArgs): Promise<Member> {
    const existing = await this.memberRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Member with id '${command.id}' not found`,
      );
    }

    existing.update({ status: command.status });

    return await this.memberRepo.update(command.id, existing);
  }

  async handleDeleteMember(command: DeleteMemberArgs): Promise<void> {
    const existing = await this.memberRepo.findById(command.id);
    if (!existing) {
      throw new BusinessException(
        ErrorEnum.RECORD_NOT_FOUND,
        `Member with id '${command.id}' not found`,
      );
    }
    await this.memberRepo.delete(command.id);
  }
}
