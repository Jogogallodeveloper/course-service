import { test, expect, beforeEach, afterAll } from "vitest";
import { randomUUID } from "crypto";
import request from "supertest";
import { server } from "../app.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import { courses, enrollments, users } from "../database/schema.ts";
import { db } from "../database/client.ts";
import { hash } from "argon2";
import { number } from "zod";

//clear the dependent tables for each test
beforeEach(async () => {
  await db.delete(enrollments);
  await db.delete(courses);
  await db.delete(users);
});

afterAll(async () => {
  await server.close();
});

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

/**
 * ORDER BY (title ASC)
 * Create 3 courses out of orderBy, filter by prefix,
 * and verify the order of the titles are asc.
 */
test("Test orderBy title asc when orderby=title", async () => {
  await server.ready();

  const prefix = randomUUID(); // filter only this courses
  await makeCourse(`${prefix}-Curso C`);
  await makeCourse(`${prefix}-Curso A`);
  await makeCourse(`${prefix}-Curso B`);

  const res = await request(server.server).get(
    `/courses?orderby=title&search=${prefix}`
  );

  expect(res.status).toBe(200);

  const titles = res.body.courses.map((c: any) => c.title);

  expect(titles).toEqual([
    `${prefix}-Curso A`,
    `${prefix}-Curso B`,
    `${prefix}-Curso C`,
  ]);

  //basic shape
  res.body.courses.forEach((c: any) => {
    expect(c).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      enrollments: expect.any(Number),
    });
  });
});

/**
 * LEFT JOIN + COUNT(enrollments)
 * c1 = 2 enrolments, c2 = 1, c3 = 0
 * Verify the count by coursor and garanti that dont have double lines (groupBy ok).
 */
test("Left Join count the total enrollments by course", async () => {
  //await fastify server be ready to work
  await server.ready();

  //Generate a unique identify
  const prefix = randomUUID();

  // generate hash
  const passwordHash = await hash("123456");

  //create courses
  const c1 = await makeCourse(`${prefix}-Node`);
  const c2 = await makeCourse(`${prefix}-JS`);
  const c3 = await makeCourse(`${prefix}-Angular`);

  //create users
  const [u1] = await db
    .insert(users)
    .values({
      name: "U1",
      email: `${prefix}+u1@exemple.com`,
      password: passwordHash,
    })
    .returning({ id: users.id });

  const [u2] = await db
    .insert(users)
    .values({
      name: "U2",
      email: `${prefix}+u2@example.com`,
      password: passwordHash,
    })
    .returning({ id: users.id });

  const [u3] = await db
    .insert(users)
    .values({
      name: "U3",
      email: `${prefix}+u3@example.com`,
      password: passwordHash,
    })
    .returning({ id: users.id });

  const [u4] = await db
    .insert(users)
    .values({
      name: "U4",
      email: `${prefix}+u4@example.com`,
      password: passwordHash,
    })
    .returning({ id: users.id });

  // const [u3] = await db
  //   .insert(users)
  //   .values({ name: "U3", email: `${prefix}+u3@exemple.com` })
  //   .returning({ id: users.id });

  //enrollements c1=2; c2=1; c3=0
  await db.insert(enrollments).values([
    { userId: u1.id, courseId: c1.id },
    { userId: u2.id, courseId: c1.id },
    { userId: u1.id, courseId: c2.id },
  ]);

  const res = await request(server.server).get(
    `/courses?search=${encodeURIComponent(prefix)}`
  );

  // expect suscesse message
  expect(res.status).toBe(200);

  // Create title mapa -> count
  const countsByTitle = Object.fromEntries(
    res.body.courses.map((c: any) => [c.title, c.enrollments])
  );

  //expect count of lefjoin
  expect(countsByTitle[`${prefix}-Node`]).toBe(2);
  expect(countsByTitle[`${prefix}-JS`]).toBe(1);
  expect(countsByTitle[`${prefix}-Angular`]).toBe(0);

  // no duplicate lines (one item by coursor)
  const uniqueTitles = new Set(res.body.courses.map((c: any) => c.title));
  expect(uniqueTitles.size).toBe(3);

  // basic shape
  res.body.courses.forEach((c: any) => {
    expect(c).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      enrollments: expect.any(Number),
    });
  });
});
