import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import * as path from 'path';

export const initSwagger = (app: INestApplication) => {
  try {
    const swaggerConfig = readFileSync(path.join(__dirname, '../../../swagger.json'), 'utf8');
    const swaggerDocument = JSON.parse(swaggerConfig);

    SwaggerModule.setup('docs', app, swaggerDocument);
  } catch (error) {
    console.error(error);
    const config = new DocumentBuilder().setTitle('nest-boilerplate').setDescription('The API description').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
};
