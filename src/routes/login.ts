//Caio56@hotmail.com
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, users } from "../database/schema.ts";
import { eq } from "drizzle-orm";
import z from "zod";
import { verify } from "argon2";

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/sessions",
    {
      schema: {
        tags: ["auth"],
        summary: "login",
        body: z.object({
          email: z.email(),
          password: z.string(),
        }),
        //   response: {
        //     201: z.object({ courseId: z.uuid() }).describe('Curso criado com sucesso!')
        //   }
      },
    },
    async (request, reply) => {
      // get the email and password from de body req
      const { email, password } = request.body;

      // get the user email and password on db
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      //if the credentials dont not exists reply error 404
      if (result.length === 0) {
        return reply.status(400).send({
          message: "Invalid Credentials",
        });
      }

      // get the user
      const user = result[0];

      // use the varify function form argon2 to verify the password
      const doesPasswordMatch = await verify(user.password, password);

      //if the password does not march return 404 error
      if (!doesPasswordMatch) {
        if (result.length === 0) {
          return reply.status(400).send({
            message: "Invalid Credentials",
          });
        }
      }

      return reply.status(200).send({ message: 'ok' });
    }
  );
};
