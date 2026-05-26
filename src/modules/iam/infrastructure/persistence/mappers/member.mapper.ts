import { AccessControlStatus } from '@/common/enum';
import {
  MemberBaseProps,
  Member,
} from '@/modules/iam/domain/entities/member.entity';
import { Prisma, Member as PrismaMember } from '@internal/rbac/client';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { MemberResponseDto } from '@/modules/iam/presentation/dtos/res/member-response.dto';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';

export class MemberMapper {
  static toDomain(props: PrismaMember): Member {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };
    return Member.create({
      id,
      status: props.status as AccessControlStatus,
      created_at: props.created_at,
      updated_at: props.updated_at,
      staff_id: props.staff_id,
      project_id: props.project_id,
      attributes: Attributes.create(props.context_attributes),
    });
  }

  static toPrisma(props: Member): PrismaMember {
    return {
      id: props.id.value,
      staff_id: props.staff_id,
      project_id: props.project_id,
      status: props.status,
      created_at: props.created_at,
      updated_at: props.updated_at,
      context_attributes: props.attributes.value as Prisma.JsonObject,
    };
  }

  static toCreateInput(props: MemberBaseProps): Prisma.MemberCreateInput {
    return {
      project: {
        connect: {
          id: props.project_id,
        },
      },
      staff: {
        connect: {
          id: props.staff_id,
        },
      },
      status: props.status,
      created_at: props.created_at,
      updated_at: props.updated_at,
    };
  }

  static toUpdateInput(props: MemberBaseProps): Prisma.MemberUpdateInput {
    return {
      status: props.status,
      updated_at: props.updated_at,
    };
  }

  static toResponseDto(props: Member): MemberResponseDto {
    return {
      id: props.id.value,
      staff_id: props.staff_id,
      project_id: props.project_id,
      status: props.status,
      created_at: props.created_at,
      updated_at: props.updated_at,
    };
  }
}
