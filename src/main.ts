import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  HttpException,
  HttpStatus,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  console.log('STEP 1 - before create');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.setGlobalPrefix('api/v1', {
    // exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const getMessage = (error: ValidationError) => {
          if (error.constraints) {
            return Object.values(error.constraints)[0];
          } else if (error.children && error.children.length > 0) {
            return getMessage(error.children[0]);
          }
          return 'Validation failed';
        };

        const message = getMessage(errors[0]);
        const response = { message, statusCode: HttpStatus.BAD_REQUEST };
        throw new HttpException(response, HttpStatus.BAD_REQUEST);
      },
    }),
  );
  const configService = app.get(ConfigService);

  const ap = configService.get('PORT') || 9000;
  console.log(`before Server running on http://localhost:${ap}`);

  const apiDocConfig = new DocumentBuilder()
    .setTitle('Synapse API')
    .setDescription('This api documentation is for Synapse App API')
    .setVersion('1.0')
    .addTag('Synapse App')
    .addBearerAuth()
    .build();
  const apiDoc = SwaggerModule.createDocument(app, apiDocConfig);
  SwaggerModule.setup('api', app, apiDoc);
  const port = configService.get('PORT');
  console.log('STEP 2 - after create');

  await app.listen(port);
  console.log('STEP 3 - AFTER LISTEN (MUST PRINT)');
}
bootstrap();
