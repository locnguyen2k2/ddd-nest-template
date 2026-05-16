export const MAILER_PORT = 'MAILER_PORT';

export interface MailerPort {
  sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context?: any;
  }): Promise<void>;
}
