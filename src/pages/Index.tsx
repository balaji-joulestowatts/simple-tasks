import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Auth from "./Auth";
import TodoList from "@/components/TodoList";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(164_35%_84%_/_0.26),transparent_38%),radial-gradient(circle_at_82%_12%,hsl(17_88%_82%_/_0.24),transparent_42%)]" />
        <div className="relative rounded-xl border border-border/80 bg-card/85 px-6 py-5 text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
          Preparing your workspace...
        </div>
      </div>
    );
  }

  if (!session) return <Auth />;

  return <TodoList onSignOut={() => supabase.auth.signOut()} />;
};

export default Index;
