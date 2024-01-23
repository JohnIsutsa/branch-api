import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

  const cfg = app.get(ConfigService);
  const PORT = cfg.get('app.port');
  const MODE = cfg.get('app.mode');
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://branch-app.vercel.app/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Branch API')
    .setDescription('The Branch customer service API documentation')
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Tickets')
    .addTag('Messages')
    .addTag('Parser')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
  console.log(`Application is running on ${MODE}: ${await app.getUrl()}/api`);

}
bootstrap();
