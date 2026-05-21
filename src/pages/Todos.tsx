import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TodoList from "@/components/TodoList";

function useTabRouting() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = React.useMemo(() => {
    if (location.pathname.endsWith("/new")) return "form";
    return "list";
  }, [location.pathname]);

  const onValueChange = (val: string) => {
    if (val === "form") navigate("/todos/new");
    else navigate("/todos");
  };

  return { current, onValueChange };
}

export default function Todos() {
  const { current, onValueChange } = useTabRouting();

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Smart Todos</h1>
        {current === "form" ? (
          <Button asChild>
            <Link to="/todos">View List</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/todos/new">Add Todo</Link>
          </Button>
        )}
      </div>

      <Tabs value={current} onValueChange={onValueChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="form">Add Todo</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Your Todos</CardTitle>
            </CardHeader>
            <CardContent>
              <TodoList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Create a Todo</CardTitle>
            </CardHeader>
            <CardContent>
              <TodoForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TodoForm() {
  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      // Placeholder submit. Integrate with your data layer here (e.g., Supabase) if needed.
      // Example: await createTodo({ title, details })
      // For now we just simulate delay.
      await new Promise((res) => setTimeout(res, 300));
      // After successful creation, go back to list
      navigate("/todos");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Input
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate("/todos")}>Cancel</Button>
      </div>
    </form>
  );
}
