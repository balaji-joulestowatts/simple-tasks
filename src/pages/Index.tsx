import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TodoList from "@/components/TodoList";
import Dashboard from "./Dashboard";
import { supabase } from "@/integrations/supabase/client";

const Index: React.FC = () => {
  const [active, setActive] = React.useState<"todo" | "dashboard">("todo");
  const navigate = useNavigate();

  const links: { key: "todo" | "dashboard"; label: string }[] = [
    { key: "todo", label: "Todo" },
    { key: "dashboard", label: "Dashboard" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="h-screen flex">
      <aside className="w-56 border-r bg-muted/30 p-3">
        <div className="mb-3 text-sm font-semibold text-muted-foreground">Pages</div>
        <nav className="flex flex-col gap-1">
          {links.map((item) => (
            <Button
              key={item.key}
              variant={active === item.key ? "secondary" : "ghost"}
              className="justify-start"
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start text-red-500 hover:text-red-600"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </aside>

      <main className="flex-1 h-full">
        {active === "todo" ? (
          <section aria-label="Todo list" className="h-full">
            <h1 className="text-2xl font-semibold mb-3 px-3">Todo</h1>
            <TodoList />
          </section>
        ) : (
          <section aria-label="Dashboard" className="h-full">
            <h1 className="text-2xl font-semibold mb-3 px-3">Dashboard</h1>
            <Dashboard />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
