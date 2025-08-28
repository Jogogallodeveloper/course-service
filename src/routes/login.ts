//Caio56@hotmail.com
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, enrollments, users } from "../database/schema.ts";
import jwt from 'jsonwebtoken'
import { eq } from "drizzle-orm";
import {z} from "zod";
import { verify } from "argon2";

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/sessions",
    {
      schema: {
        tags: ["auth"],
        summary: "login",
        body: z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }),
          response: {
            200: z.object({ token: z.string() }),
            400: z.object({ message: z.string() }),
          }
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
        return reply.status(400).send({
          message: "Invalid Credentials",
        });
      }
      // check if JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET must be set");
      }

      const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET
      );

      return reply.status(200).send({ token });
    }
  );
};
