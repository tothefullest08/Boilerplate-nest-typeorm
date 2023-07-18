import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@src/app.module';
import { initSwagger } from '@src/common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.port ?? 3000;

  app.enableCors();
  app.useLogger(app.get(Logger));
  initSwagger(app);

  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0); // 정상 종료
  });
  await app.listen(port, () => {
    if (process.send) {
      (process as any).send('ready');
    }
    console.log(`Server is running on port ${port}`);
  });
}

bootstrap();
