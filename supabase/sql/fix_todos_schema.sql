-- Production-safe bootstrap for public.todos columns used by the app.
-- Can be run multiple times safely.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.todos
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS priority TEXT;

UPDATE public.todos
SET priority = 'medium'
WHERE priority IS NULL;

ALTER TABLE public.todos
ALTER COLUMN priority SET DEFAULT 'medium';

ALTER TABLE public.todos
ALTER COLUMN priority SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'todos_priority_check'
      AND conrelid = 'public.todos'::regclass
  ) THEN
    ALTER TABLE public.todos
    ADD CONSTRAINT todos_priority_check
    CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'todos'
      AND policyname = 'Users can view their own todos'
  ) THEN
    CREATE POLICY "Users can view their own todos" ON public.todos
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'todos'
      AND policyname = 'Users can create their own todos'
  ) THEN
    CREATE POLICY "Users can create their own todos" ON public.todos
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'todos'
      AND policyname = 'Users can update their own todos'
  ) THEN
    CREATE POLICY "Users can update their own todos" ON public.todos
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'todos'
      AND policyname = 'Users can delete their own todos'
  ) THEN
    CREATE POLICY "Users can delete their own todos" ON public.todos
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Force PostgREST to reload its schema cache.
NOTIFY pgrst, 'reload schema';
