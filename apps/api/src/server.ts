import 'dotenv/config';
import { buildApp } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

async function start() {
  const app = buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();