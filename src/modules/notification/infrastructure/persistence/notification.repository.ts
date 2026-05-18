import { Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { NotificationStatus as PrismaNotificationStatus, NotificationChannel as PrismaNotificationChannel } from '@internal/rbac/client';
import { NotificationStatus } from '../../domain/value-objects/notification.enum';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async save(notification: Notification): Promise<void> {
    const result = await this.prisma.notification.upsert({
      where: { id: notification.id },
      update: {
        status: notification.status as unknown as PrismaNotificationStatus,
        error_message: notification.errorMessage,
        updated_at: notification.updatedAt,
        recipient: notification.recipient as any,
        content: notification.content as any,
      },
      create: {
        id: notification.id,
        recipient: notification.recipient as any,
        channel: notification.channel as unknown as PrismaNotificationChannel,
        content: notification.content as any,
        status: notification.status as unknown as PrismaNotificationStatus,
        error_message: notification.errorMessage,
        created_at: notification.createdAt,
        updated_at: notification.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!record) return null;

    return new Notification(
      record.id,
      record.recipient as any,
      record.channel as any,
      record.content as any,
      record.status as any,
      record.error_message || undefined,
      record.created_at,
      record.updated_at,
    );
  }

  async updateStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: {
        status: status as unknown as PrismaNotificationStatus,
        error_message: errorMessage,
        updated_at: new Date(),
      },
    });
  }
}
