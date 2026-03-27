import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus, Prisma, User } from '@prisma/client';

export class UserMapper {
    static toDomain(props: User): UserEntity {
        const id: IEntityID<string> = {
            value: props.id,
            _id: props.id,
            get: () => props.id,
        };

        return UserEntity.create({
            id: id,
            email: props.email,
            username: props.username,
            password: props.password,
            first_name: props.first_name,
            last_name: props.last_name,
            created_at: props.created_at,
            updated_at: props.updated_at,
        });
    }

    static toPrisma(props: UserEntity): User {
        return {
            id: props.id.value,
            email: props.email(),
            username: props.username(),
            password: props.password(),
            first_name: props.firstName(),
            last_name: props.lastName(),
            status: props.status(),
            created_at: props.createdAt(),
            updated_at: props.updatedAt(),
        };
    }

    static toPrismaUpdate(user: UserEntity): Prisma.UserUpdateInput {
        return {
            first_name: user.firstName(),
            last_name: user.lastName(),
            password: user.password(),
            updated_at: new Date(),
        };
    }

    static toResponseDto(user: Prisma.UserCreateInput): UserResponseDto {
        return {
            id: user.id!,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            status: user.status || AccessControlStatus.ACTIVE,
            created_at: user.created_at as Date,
            updated_at: user.updated_at as Date,
        };
    }
}
