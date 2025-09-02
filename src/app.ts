import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { createCourseRoute } from './routes/create-course.ts'
import { getCourseByIdRoute } from './routes/get-course-by-id.ts'
import { getCoursesRoute } from './routes/get-courses.ts'
import scalarAPIReference from '@scalar/fastify-api-reference'
import { loginRoute } from './routes/login.ts'

const isProd = process.env.NODE_ENV === 'production'

const server = fastify({
  logger: isProd
    ? true // logger padrão em prod (sem pino-pretty)
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
}).withTypeProvider<ZodTypeProvider>()

// Docs só em dev
if (!isProd) {
  server.register(fastifySwagger, {
    openapi: {
      info: { title: 'Desafio Node.js', version: '1.0.0' },
    },
    transform: jsonSchemaTransform,
  })

  server.register(scalarAPIReference, {
    routePrefix: '/docs',
  })
}

// Healthcheck para o Fly
server.get('/healthz', async () => ({ ok: true }))

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.register(createCourseRoute)
server.register(getCourseByIdRoute)
server.register(getCoursesRoute)
server.register(loginRoute)

export { server }
