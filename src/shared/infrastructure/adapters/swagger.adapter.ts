import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  ConfigKeyPaths,
  ISwaggerConfig,
  swaggerConfigKey,
} from '@/config/index';

@Injectable()
export class SwaggerAdapter {
  constructor(private readonly configService: ConfigService<ConfigKeyPaths>) { }

  setup(app: NestFastifyApplication) {
    const config = this.configService.get<ISwaggerConfig>(swaggerConfigKey, {
      infer: true,
    });

    if (!config?.enable) return;

    const documentConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API documentation for the application')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      })
      .build();

    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup(config.path, app, document);
  }
}
