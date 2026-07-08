import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  applicationSchema,
  createApplicationSchema,
  updateApplicationSchema,
  applicationListQuerySchema,
  paginatedSchema,
} from '@candidate-tracker/shared';
import { applicationsService } from './applications.service';

const paramsSchema = z.object({ id: z.string().uuid() });

const applicationListItemSchema = applicationSchema.extend({
  candidateName: z.string(),
  candidateEmail: z.string(),
});

const applicationWithCandidateSchema = applicationSchema.extend({
  candidate: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string(),
  }),
});

export const applicationsRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/',
    {
      schema: {
        querystring: applicationListQuerySchema,
        response: { 200: paginatedSchema(applicationListItemSchema) },
      },
    },
    async (request) => applicationsService.list(request.query)
  );

  server.get(
    '/:id',
    { schema: { params: paramsSchema, response: { 200: applicationWithCandidateSchema } } },
    async (request) => applicationsService.getById(request.params.id)
  );

  server.post(
    '/',
    { schema: { body: createApplicationSchema, response: { 201: applicationSchema } } },
    async (request, reply) => {
      const application = await applicationsService.create(request.body);
      return reply.status(201).send(application);
    }
  );

  server.patch(
    '/:id',
    { schema: { params: paramsSchema, body: updateApplicationSchema, response: { 200: applicationSchema } } },
    async (request) => applicationsService.update(request.params.id, request.body)
  );

  server.delete(
    '/:id',
    { schema: { params: paramsSchema } },
    async (request, reply) => {
      await applicationsService.remove(request.params.id);
      return reply.status(204).send();
    }
  );
};