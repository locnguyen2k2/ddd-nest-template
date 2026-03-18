import { Module } from '@nestjs/common';
import { AblyService } from './ably.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AblyService],
  exports: [AblyService],
})
export class AblyModule { }
