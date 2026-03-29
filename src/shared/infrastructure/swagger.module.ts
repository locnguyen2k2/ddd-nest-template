import { Module } from '@nestjs/common';
import { SwaggerAdapter } from '@/shared/infrastructure/adapters/swagger.adapter';

@Module({
  providers: [SwaggerAdapter],
  exports: [SwaggerAdapter],
})
export class SwaggerModule {}
