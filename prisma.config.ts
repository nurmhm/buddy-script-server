import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import path from 'node:path';

export default defineConfig({
  schema: path.join('prisma', 'schema'),
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx ./src/utils/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
