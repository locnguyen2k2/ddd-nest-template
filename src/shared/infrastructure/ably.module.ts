import { Module } from '@nestjs/common';
import { AblyAdapter } from './adapters/ably.adapter';

@Module({
  imports: [],
  controllers: [],
  providers: [AblyAdapter],
  exports: [AblyAdapter],
})
export class AblyModule { }
