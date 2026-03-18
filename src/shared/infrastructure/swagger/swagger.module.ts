import { Module } from '@nestjs/common';
import { SwaggerService } from '@/shared/infrastructure/swagger/swagger.service';

@Module({
    providers: [SwaggerService],
    exports: [SwaggerService],
})
export class SwaggerModule { }
