import { IAttemptPolicy } from '@/common/constant';
import { UserEntity } from '../entities/user.entity';
import { IConfirmationCode } from '../services/user.service';

export const USER_REPO = 'USER_REPOSITORY';
export interface IUserRepository {
  create(props: UserEntity): Promise<UserEntity>;
  update(props: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByIdWithOrganizations(userId: string): Promise<UserEntity | null>;
  findByIdWithOrganization(
    userId: string,
    orgId: string,
  ): Promise<UserEntity | null>;
  requestConfirmationCode(user: UserEntity): Promise<IConfirmationCode>;
  warningPasswordSecurity(user: UserEntity, policy: IAttemptPolicy): Promise<void>;
  findByEmailOrUsername(emailOrUsername: string): Promise<UserEntity | null>;
}
