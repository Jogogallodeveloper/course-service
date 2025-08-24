import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
  pgEnum
} from "drizzle-orm/pg-core";

export const userRole = pgEnum('user_role',[
  'student',
  'manager'
])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text().notNull(),
  role: userRole().notNull().default('student'),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description"),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(), // <- PK única
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("enrollments_user_course_uk").on(t.userId, t.courseId), // <- garante 1 matrícula por par
    index("enrollments_user_idx").on(t.userId),
    index("enrollments_course_idx").on(t.courseId),
  ]
);
