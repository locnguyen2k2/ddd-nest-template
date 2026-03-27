import { UserEntity } from "../entities/user.entity";

export const USER_REPO = "USER_REPOSITORY";
export interface IUserRepository {
    create(props: UserEntity): Promise<UserEntity>;
    update(props: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
    findByID(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
    findByUsernameOrEmail(usernameOrEmail: string): Promise<UserEntity | null>;
}