import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TodoList = ({ onSignOut }: { onSignOut: () => void }) => {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTodo = useMutation({
    mutationFn: async (title: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("todos").insert({ title, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleTodo = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("todos").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) addTodo.mutate(newTodo.trim());
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-background p-4 pt-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Todos</h1>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={addTodo.isPending || !newTodo.trim()}>
            <Plus className="h-5 w-5" />
          </Button>
        </form>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No todos yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) =>
                    toggleTodo.mutate({ id: todo.id, completed: checked === true })
                  }
                />
                <span
                  className={`flex-1 ${
                    todo.completed ? "text-muted-foreground line-through" : "text-card-foreground"
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTodo.mutate(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodoList;
