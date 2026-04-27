ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS priority TEXT;

ALTER TABLE public.todos
ALTER COLUMN user_id SET DEFAULT auth.uid();

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

NOTIFY pgrst, 'reload schema';