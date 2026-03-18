import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigKeyPaths, ISwaggerConfig, swaggerConfigKey } from '@/config/index';

@Injectable()
export class SwaggerService {
    constructor(private readonly configService: ConfigService<ConfigKeyPaths>) { }

    setup(app: NestFastifyApplication) {
        const config = this.configService.get<ISwaggerConfig>(swaggerConfigKey, { infer: true });

        if (!config?.enable) return;

        const documentConfig = new DocumentBuilder()
            .setTitle('API Documentation')
            .setDescription('API documentation for the application')
            .setVersion('1.0')
            // .addServer(config.serverUrl || '')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, documentConfig);
        SwaggerModule.setup(config.path, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        },);
    }
}
