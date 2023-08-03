import { INestiaConfig } from '@nestia/sdk';

const config: INestiaConfig = {
  input: 'src/**/*.controller.ts',
  output: 'src/api',
  distribute: 'packages/api',
  e2e: 'test',
  swagger: {
    output: 'dist/swagger.json',
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
  },
};
export default config;
