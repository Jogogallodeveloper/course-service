import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import z from "zod";
import { ilike } from "drizzle-orm";

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses",
    {
      schema: {
        tags: ["courses"],
        summary: "Get all courses",
        querystring: z.object({
          search: z.string().optional(),
          orderBy: z.enum(["title"]).optional().default("title")
        }),
        response: {
          200: z.object({
            courses: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy } = request.query;
      const result = await db
        .select({
          id: courses.id,
          title: courses.title,
        })
        .from(courses)
        .where(search ? ilike(courses.title, `%${search}%`) : undefined)

      return reply.send({ courses: result });
    }
  );
};
