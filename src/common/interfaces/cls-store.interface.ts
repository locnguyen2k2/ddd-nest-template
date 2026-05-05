import { ClsStore } from 'nestjs-cls';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { StorageKeys } from '../constant';

export interface MyClsStore extends ClsStore {
  [StorageKeys.ORG_ID]: string;
  [StorageKeys.ORG_SLUG]: string;
  [StorageKeys.PROJECT_ID]: string;
  [StorageKeys.ORG]: Organization;
}
