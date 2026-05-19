import { Injectable } from '@nestjs/common';
import { MailerPort, MailType } from '@/shared/application/ports/mailer.port';
import { MailerService as NestedMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerAdapter implements MailerPort {
    private readonly mailerStrategy = {
        [MailType.CONFIRMED]: async (email: string, token: string) =>
            await this[MailType.CONFIRMED](email, token),
        [MailType.PASSWORD]: async (email: string, token: string) =>
            await this[MailType.PASSWORD](email, token),
    };
    private async [MailType.CONFIRMED](email: string, token: string): Promise<any> {
        const text = `${token}`;

        return await this.mailService.sendMail({
            to: email,
            subject: 'Email confirmation',
            template: './confirmation',
            context: {
                content: text,
            },
        });
    }
    private async [MailType.PASSWORD](email: string, token: string): Promise<any> {
        const text = `${token}`;

        return await this.mailService.sendMail({
            to: email,
            subject: 'Confirmation reset password email',
            template: './reset-password',
            context: {
                content: text,
            },
        });
    }

    constructor(private readonly mailService: NestedMailerService) { }

    async sendSecretCode(
        email: string,
        code: string,
        type: MailType,
    ): Promise<any> {
        try {
            return await this.mailerStrategy[type](email, code);
        } catch (e: any) {
            console.log(e)
        }
    }

    async sendEmail(options: { to: string; subject: string; template: string; context?: any }): Promise<void> {
        const { to, subject, template, context } = options;

        try {
            return await this.mailService.sendMail({
                to: to,
                subject: subject,
                template: template,
                context,
            });
        } catch (e: any) { console.log(e) }
    }
}
