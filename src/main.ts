import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyBasicAuth from '@fastify/basic-auth';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { appConfigKey, ConfigKeyPaths, IAppConfig } from '@/config';
import { TransformInterceptor } from '@/common/interceptors/transform-interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging-interceptor';
import { HttpExceptionFilter } from '@/common/interceptors/http-interceptor';
import { SwaggerAdapter } from '@/shared/infrastructure/adapters/swagger.adapter';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    routerOptions: {
      caseSensitive: true,
      ignoreTrailingSlash: true,
    },
    trustProxy: true,
    bodyLimit: 40 * 1024 * 1024,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  const configService = app.get(ConfigService<ConfigKeyPaths>);
  const { port, basicAuthPassword, basicAuthUsername } = configService.get<IAppConfig>(appConfigKey, { infer: true });

  const authenticate = async (
    username: string,
    password: string,
    request,
    reply,
    done,
  ) => {
    if (
      username !== basicAuthUsername ||
      password !== basicAuthPassword
    ) {
      reply.code(401).send({
        statusCode: 401,
        message: 'Unauthorized: Invalid Swagger credentials',
        error: 'Unauthorized',
      });
    }
  };

  await (app as any).register(fastifyBasicAuth, {
    validate: authenticate,
    authenticate: true,
  });
  await (app as any).register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5,
    },
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger
  const swaggerService = app.get(SwaggerAdapter);

  await app.register(async (fastify) => {
    // `basicAuth` is available *after* registration is complete
    fastify.after(() => {
      fastify.addHook('preHandler', fastify.basicAuth);

      // Swagger setup
      swaggerService.setup(app);
    });
  });

  await app.listen(port, '0.0.0.0', async () => {
    const prefix = 'W';
    const { pid } = process;
    const url = await app.getUrl();
    console.log(`[${prefix + pid}] Server running on ${url}`);
  });

}
bootstrap();
