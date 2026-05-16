export const MAILER_PORT = 'MAILER_PORT';
export enum MailType {
  CONFIRMED = 'confirmed',
  PASSWORD = 'password',
}

export interface MailerPort {
  sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context?: any;
  }): Promise<void>;
  sendSecretCode(
    to: string,
    code: string,
    type: MailType,
  ): Promise<any>;
}
