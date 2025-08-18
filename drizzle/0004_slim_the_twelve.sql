-- 1) Unicidade do par (user_id, course_id)
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_user_course_uk"
  ON "enrollments" USING btree ("user_id","course_id");--> statement-breakpoint

-- 2) Índices auxiliares (idempotentes)
CREATE INDEX IF NOT EXISTS "enrollments_user_idx"
  ON "enrollments" USING btree ("user_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "enrollments_course_idx"
  ON "enrollments" USING btree ("course_id");--> statement-breakpoint
