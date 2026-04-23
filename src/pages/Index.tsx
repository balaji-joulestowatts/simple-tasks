import * as React from "react";
import { Button } from "@/components/ui/button";
import TodoList from "@/components/TodoList";
import Dashboard from "./Dashboard";

const Index: React.FC = () => {
  const [active, setActive] = React.useState<"todo" | "dashboard">("todo");

  const links: { key: "todo" | "dashboard"; label: string }[] = [
    { key: "todo", label: "Todo" },
    { key: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <div className="mb-4 text-sm font-semibold text-muted-foreground">Pages</div>
        <nav className="flex flex-col gap-2">
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
      </aside>

      <main className="flex-1 p-6">
        {active === "todo" ? (
          <section aria-label="Todo list">
            <h1 className="text-2xl font-semibold mb-4">Todo</h1>
            <TodoList />
          </section>
        ) : (
          <section aria-label="Dashboard">
            <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
            <Dashboard />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
