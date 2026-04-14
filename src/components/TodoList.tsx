import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Flag, ListTodo, LogOut, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Priority = "low" | "medium" | "high";
type StatusFilter = "all" | "open" | "completed";

type NewTaskState = {
  title: string;
  description: string;
  category: string;
  dueDate: string;
  priority: Priority;
};

const initialTaskState: NewTaskState = {
  title: "",
  description: "",
  category: "",
  dueDate: "",
  priority: "medium",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-sky-100 text-sky-700 border-sky-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
};

const TodoList = ({ onSignOut }: { onSignOut: () => void }) => {
  const [newTask, setNewTask] = useState<NewTaskState>(initialTaskState);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
    mutationFn: async (task: NewTaskState) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        title: task.title,
        description: task.description || null,
        category: task.category || null,
        due_date: task.dueDate || null,
        priority: task.priority,
      };

      const { error } = await supabase.from("todos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTask(initialTaskState);
      setIsCreateDialogOpen(false);
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
    if (newTask.title.trim()) {
      addTodo.mutate({
        ...newTask,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        category: newTask.category.trim(),
      });
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const openCount = todos.length - completedCount;
  const categoryOptions = Array.from(
    new Set(todos.map((todo) => todo.category?.trim()).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b));

  const filteredTodos = todos.filter((todo) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const todoPriority = (todo.priority as Priority) ?? "medium";
    const normalizedCategory = todo.category?.trim() ?? "";

    const matchesSearch =
      normalizedSearch.length === 0 ||
      todo.title.toLowerCase().includes(normalizedSearch) ||
      (todo.description ?? "").toLowerCase().includes(normalizedSearch) ||
      normalizedCategory.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && todo.completed) ||
      (statusFilter === "open" && !todo.completed);

    const matchesPriority = priorityFilter === "all" || todoPriority === priorityFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "uncategorized" ? !normalizedCategory : normalizedCategory === categoryFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,hsl(164_38%_84%_/_0.3),transparent_35%),radial-gradient(circle_at_86%_18%,hsl(17_88%_82%_/_0.28),transparent_42%)]" />

      <main className="relative w-full max-w-2xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-lg backdrop-blur-sm sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Task board</p>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">My Todos</h1>
            <p className="text-sm text-muted-foreground">Keep your day focused and ship one task at a time.</p>
          </div>

          <Button variant="outline" className="gap-2" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </header>

        <section className="grid grid-cols-2 gap-3">
          <Card className="border-border/70 bg-card/85 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</p>
                <p className="text-2xl font-semibold text-foreground">{openCount}</p>
              </div>
              <ListTodo className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/85 shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold text-foreground">{completedCount}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 rounded-xl border border-border/70 bg-card/85 p-3 shadow-sm sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Organize your tasks</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create a new task</DialogTitle>
                  <DialogDescription>
                    Add title, details, and priority so your plan stays clear.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAdd} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                      className="h-11 bg-background/80"
                    />

                    <Input
                      placeholder="Category (e.g. Work)"
                      value={newTask.category}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, category: e.target.value }))}
                      className="h-11 bg-background/80"
                    />
                  </div>

                  <Textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-20 resize-none bg-background/80"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: Priority) => setNewTask((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="h-11 bg-background/80">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low priority</SelectItem>
                        <SelectItem value="medium">Medium priority</SelectItem>
                        <SelectItem value="high">High priority</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="h-11 bg-background/80"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full gap-2"
                    disabled={addTodo.isPending || !newTask.title.trim()}
                  >
                    <Plus className="h-5 w-5" />
                    Add task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 bg-background/80 pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="h-11 bg-background/80">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open only</SelectItem>
                <SelectItem value="completed">Completed only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: "all" | Priority) => setPriorityFilter(value)}>
              <SelectTrigger className="h-11 bg-background/80">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 bg-background/80">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {isLoading ? (
          <div className="rounded-xl border border-border/70 bg-card/80 p-8 text-center text-muted-foreground shadow-sm">
            Loading your tasks...
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="text-lg font-medium text-foreground">No todos yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first task to get started.</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="text-lg font-medium text-foreground">No matching tasks</p>
            <p className="mt-1 text-sm text-muted-foreground">Try changing your search or filters.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) =>
                    toggleTodo.mutate({ id: todo.id, completed: checked === true })
                  }
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-medium sm:text-base ${
                        todo.completed ? "text-muted-foreground line-through" : "text-card-foreground"
                      }`}
                    >
                      {todo.title}
                    </p>
                    <Badge variant="outline" className={priorityStyles[(todo.priority as Priority) ?? "medium"]}>
                      <Flag className="mr-1 h-3 w-3" />
                      {todo.priority}
                    </Badge>
                    {todo.category && (
                      <Badge variant="secondary" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {todo.category}
                      </Badge>
                    )}
                  </div>

                  {todo.description && (
                    <p className="text-sm text-muted-foreground">
                      {todo.description}
                    </p>
                  )}

                  {todo.due_date && (
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Due {new Date(todo.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive group-hover:bg-destructive/10"
                  onClick={() => deleteTodo.mutate(todo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default TodoList;
