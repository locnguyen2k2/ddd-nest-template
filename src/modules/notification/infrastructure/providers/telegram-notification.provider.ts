import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from '../../application/ports/notification-provider.port';
import { NotificationChannel } from '../../domain/value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../../domain/value-objects/notification.vo';
import { BusinessException } from '@/common/http/business-exception';
import { RequestAdapter } from '@/shared/infrastructure/adapters/http.adapter';
import { env } from '@/utils/env';

@Injectable()
export class TelegramNotificationProvider implements INotificationProvider {
  public readonly channel = NotificationChannel.TELEGRAM;
  constructor(private readonly requestService: RequestAdapter) { }

  async send(recipient: RecipientInfo, content: NotificationContent): Promise<void> {
    if (!recipient.telegram_id) {
      throw new BusinessException('400|Telegram ID is missing for TELEGRAM channel');
    }

    try {
      if (env.str('TELEGRAM_BOT_API').length > 0 && env.str('TELEGRAM_BOT_TOKEN').length > 0) {
        await this.requestService.post(
          env.str('TELEGRAM_BOT_API') + `${env.str('TELEGRAM_BOT_TOKEN')}/sendMessage`,
          {
            chat_id: recipient.telegram_id,
            text: `\`\`\`\n${content.body}\n\`\`\``,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          },
        )
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }
}
