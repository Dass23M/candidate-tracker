import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: 'Request validation failed',
      details: error.flatten(),
    });
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({ error: 'NotFound', message: error.message });
  }

  if (error instanceof ConflictError) {
    return reply.status(409).send({ error: 'Conflict', message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({ error: 'Conflict', message: 'A record with this value already exists' });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({ error: 'NotFound', message: 'Record not found' });
    }
  }

  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;

  return reply.status(statusCode).send({
    error: 'InternalServerError',
    message: statusCode === 500 ? 'Something went wrong' : error.message,
  });
}