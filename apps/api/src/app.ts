import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { errorHandler } from './plugins/error-handler';
import { candidatesRoutes } from './modules/candidates/candidates.routes';
import { applicationsRoutes } from './modules/applications/applications.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  app.register(candidatesRoutes, { prefix: '/api/candidates' });
  app.register(applicationsRoutes, { prefix: '/api/applications' });
  app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  return app;
}