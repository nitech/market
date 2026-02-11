import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { apiRoutes } from './routes/api';

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(apiRoutes)
  .listen(3000);

console.log(`🚀 Server is running at http://localhost:${app.server?.port}`);

