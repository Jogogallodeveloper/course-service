import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, enrollments } from "../database/schema.ts";
import { ilike, asc, and, eq, count } from "drizzle-orm";
import { z } from "zod";
import { checkRequestJWT } from "./hooks/check-request.jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses",
    {
      schema: {
        preHandler: [
          checkRequestJWT,
          checkUserRole('manager'),
        ],
        tags: ["courses"],
        summary: "Get all courses",
        querystring: z.object({
          search: z.string().optional(),
          orderby: z.enum(["id", "title"]).optional().default("id"),
          page: z.coerce.number().optional().default(1),
        }),
        response: {
          200: z.object({
            courses: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
                enrollments: z.number(),
              })
            ),
            total : z.number()
          }),
        },
      },
    },
    async (request, reply) => {
      const { search, orderby, page } = request.query;

      //define the const variable where clausules
      const conditions = []

      if (search) {
        conditions.push(ilike(courses.title, `%${search}%`))
      }

      //define the constan variable query 
      const [result, total] = await Promise.all([
      db
        .select({
          id: courses.id,
          title: courses.title,
          enrollments: count(enrollments.id),
        })
        .from(courses)
        .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
        .groupBy(courses.id, courses.title) 
        .orderBy(asc(courses[orderby]))
        .offset((page - 1) * 2)
        .limit(10)
        .where(and(...conditions)),
        db.$count(courses, and(...conditions))
        ])

      return reply.send({ courses: result, total });
    }
  );
};
