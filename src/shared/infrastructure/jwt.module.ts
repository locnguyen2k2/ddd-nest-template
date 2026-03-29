import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JWT_PORT } from '../application/ports/jwt.port';
import { JwtAdapter } from './adapters/jwt.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: JWT_PORT,
      useClass: JwtAdapter,
    },
    JwtAdapter,
  ],
  exports: [JWT_PORT, JwtAdapter],
})
export class JwtModule {}
