import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from '@/config';
import { MailerAdapter } from './adapters/mailer.adapter';

@Module({
  imports: [
    NestMailerModule.forRootAsync(MailerConfig.asProvider()),
  ],
  providers: [MailerAdapter],
  exports: [MailerAdapter],
})
export class MailerModule { }
