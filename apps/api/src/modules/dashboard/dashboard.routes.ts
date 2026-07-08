import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { dashboardMetricsSchema } from '@candidate-tracker/shared';
import { dashboardService } from './dashboard.service';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/',
    { schema: { response: { 200: dashboardMetricsSchema } } },
    async () => dashboardService.getMetrics()
  );
};