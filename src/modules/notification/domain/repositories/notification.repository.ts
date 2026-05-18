import { Notification } from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  updateStatus(id: string, status: any, errorMessage?: string): Promise<void>;
}
