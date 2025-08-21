import { test, expect, beforeEach, afterAll } from "vitest";
import { randomUUID } from "crypto";
import request from "supertest";
import { server } from "../app.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import { courses, enrollments, users } from "../database/schema.ts";
import { db } from "../database/client.ts";

//clear the dependent tables for each test
beforeEach(async () => {
  await db.delete(enrollments);
  await db.delete(courses);
  await db.delete(users);
});

afterAll(async () => {
    await server.close()
})

test("Get courses", async () => {
  await server.ready();

  const titleId = randomUUID();

  const course = await makeCourse(titleId);

  const response = await request(server.server).get(
    `/courses?search=${titleId}`
  );

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    total: 1,
    courses: [
      {
        id: expect.any(String),
        title: titleId,
        enrollments: 0,
      },
    ],
  });
});
