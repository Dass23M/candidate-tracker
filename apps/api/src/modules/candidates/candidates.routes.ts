import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  candidateSchema,
  applicationSchema,
  createCandidateSchema,
  updateCandidateSchema,
  candidateListQuerySchema,
  paginatedSchema,
} from '@candidate-tracker/shared';
import { candidatesService } from './candidates.service';



const paramsSchema = z.object({ id: z.string().uuid() });

const candidateWithApplicationsSchema = candidateSchema.extend({
  applications: z.array(applicationSchema),
});

export const candidatesRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    '/',
    { schema: { querystring: candidateListQuerySchema, response: { 200: paginatedSchema(candidateSchema) } } },
    async (request) => candidatesService.list(request.query)
  );

  server.get(
    '/:id',
    { schema: { params: paramsSchema, response: { 200: candidateWithApplicationsSchema } } },
    async (request) => candidatesService.getById(request.params.id)
  );

  server.post(
    '/',
    { schema: { body: createCandidateSchema, response: { 201: candidateSchema } } },
    async (request, reply) => {
      const candidate = await candidatesService.create(request.body);
      return reply.status(201).send(candidate);
    }
  );

  server.patch(
    '/:id',
    { schema: { params: paramsSchema, body: updateCandidateSchema, response: { 200: candidateSchema } } },
    async (request) => candidatesService.update(request.params.id, request.body)
  );

  server.delete(
    '/:id',
    { schema: { params: paramsSchema } },
    async (request, reply) => {
      await candidatesService.remove(request.params.id);
      return reply.status(204).send();
    }
  );
};