import { Module } from '@nestjs/common';
import { NatsAdapter } from './adapters/nats.adapter';

@Module({
    imports: [],
    controllers: [],
    providers: [NatsAdapter],
    exports: [NatsAdapter],
})
export class NatsModule { }
