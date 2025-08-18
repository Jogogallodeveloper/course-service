-- Necessário para DEFAULT gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint

-- 1) Remover PK antiga (composta)
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_user_id_course_id_pk";--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_pkey";--> statement-breakpoint

-- 2) Adicionar coluna id (SEM definir PK aqui)
ALTER TABLE "enrollments"
  ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint

-- 3) Definir a nova PK em id
ALTER TABLE "enrollments"
  ADD CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id");--> statement-breakpoint
