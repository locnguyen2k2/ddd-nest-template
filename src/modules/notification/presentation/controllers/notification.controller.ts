import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../../application/commands/send-notification.command';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a notification manually' })
  async sendNotification(@Body() command: SendNotificationCommand) {
    return await this.commandBus.execute(command);
  }
}
