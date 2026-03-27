import { UserEntity } from "@/modules/iam/domain/entities/user.entity";
import { IUserRepository } from "@/modules/iam/domain/repositories/user.repository";
import { PrismaAdapter } from "@/shared/infrastructure/adapters/prisma.adapter";
import { UserMapper } from "../mappers/user.mapper";

export class UserRepository implements IUserRepository {
    constructor(private readonly dbService: PrismaAdapter) { }

    async create(props: UserEntity): Promise<UserEntity> {
        const toPrisma = UserMapper.toPrisma(props);
        const result = await this.dbService.user.create({ data: toPrisma });
        return UserMapper.toDomain(result);
    }

    async update(props: UserEntity): Promise<UserEntity> {
        const toPrisma = UserMapper.toPrisma(props);
        const result = await this.dbService.user.update({
            where: { id: props.id.value },
            data: toPrisma
        });
        return UserMapper.toDomain(result);
    }

    async delete(id: string) {
        await this.dbService.user.delete({ where: { id } });
    }

    async findByID(id: string): Promise<UserEntity | null> {
        const result = await this.dbService.user.findUnique({ where: { id } });
        if (!result) return null;
        return UserMapper.toDomain(result);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const result = await this.dbService.user.findUnique({ where: { email } });
        if (!result) return null;
        return UserMapper.toDomain(result);
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        const result = await this.dbService.user.findUnique({ where: { username } });
        if (!result) return null;
        return UserMapper.toDomain(result);
    }

    async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserEntity | null> {
        const result = await this.dbService.user.findFirst({ where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });
        if (!result) return null;
        return UserMapper.toDomain(result);
    }
}
