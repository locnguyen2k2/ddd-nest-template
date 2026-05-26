import { MailType } from "@/shared/application/ports/mailer.port";

export interface RecipientInfo {
  email?: string;
  telegram_id?: string;
  phone_number?: string;
  [key: string]: any;
}

export interface NotificationContent {
  subject?: string;
  body: string;
  type: MailType;
  template?: string;
  data?: Record<string, any>;
}
