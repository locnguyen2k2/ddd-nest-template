import { Injectable } from '@nestjs/common';
import { MailerPort } from '@/shared/application/ports/mailer.port';
import { MailerService as NestedMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerAdapter implements MailerPort {
    constructor(private readonly mailService: NestedMailerService) { }

    async sendEmail(options: { to: string; subject: string; template: string; context?: any }): Promise<void> {
        const { to, subject, template, context } = options;
        const text = `${context.token}`;

        return await this.mailService.sendMail({
            to: to,
            subject: subject,
            template: template,
            context: {
                content: text,
            },
        });
    }
}
