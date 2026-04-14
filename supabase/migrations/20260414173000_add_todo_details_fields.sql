ALTER TABLE public.todos
ADD COLUMN description TEXT,
ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN due_date DATE,
ADD COLUMN category TEXT;
