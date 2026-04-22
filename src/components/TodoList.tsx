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
      toast({ title: "Task added", description: "Your task has been created successfully." });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Task deleted", description: "Task has been removed from your list." });
    },
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
  const completionPercentage = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative min-h-screen">
      <nav className="nav-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">FocusFlow</h2>
              <p className="text-xs text-muted-foreground">Productivity System</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 rounded-lg" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">{getGreeting()}</p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your Workspace</h1>
            <p className="text-muted-foreground">You have {openCount} tasks to complete today. Keep going!</p>
          </div>

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative group">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full pl-10 border-none bg-secondary/50 focus-visible:ring-primary/50 sm:w-64"
              />
              <Tag className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-1">
              {(["all", "open", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${statusFilter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="premium-card md:col-span-1">
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground text-xs">Progress</p>
                <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{completionPercentage}%</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={364.42}
                      strokeDashoffset={364.42 - (364.42 * completionPercentage) / 100}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold">{completedCount}</span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Done</span>
                  </div>
                </div>
                <div className="grid w-full grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-secondary/30 p-4 text-center">
                    <p className="text-lg font-bold">{openCount}</p>
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Open</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/30 p-4 text-center">
                    <p className="text-lg font-bold">{todos.length}</p>
                    <p className="text-[10px] font-medium uppercase text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <section className="premium-card rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-5 leading-none font-black text-7xl select-none">TASK</div>
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
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                          <Input
                            placeholder="What needs to be done?"
                            value={newTask.title}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                            className="h-12 border-none bg-secondary/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                          />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                          <Input
                            placeholder="Work, Life, etc."
                            value={newTask.category}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, category: e.target.value }))}
                            className="h-12 border-none bg-secondary/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                        <Textarea
                          placeholder="The details go here..."
                          value={newTask.description}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                          className="min-h-[80px] border-none bg-secondary/30 focus-visible:ring-2 focus-visible:ring-primary/30 resize-none"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: Priority) => setNewTask((prev) => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger className="h-12 border-none bg-secondary/30 focus-visible:ring-2 focus-visible:ring-primary/30">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low priority</SelectItem>
                              <SelectItem value="medium">Medium priority</SelectItem>
                              <SelectItem value="high">High priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Due Date</label>
                          <Input
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                            className="h-12 border-none bg-secondary/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="h-12 w-full gap-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
                        disabled={addTodo.isPending || !newTask.title.trim()}
                      >
                        {addTodo.isPending ? "Adding..." : (
                          <>
                            <Plus className="h-5 w-5" />
                            CREATE TASK
                          </>
                        )}
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

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Tasks</h3>
                <span className="text-xs font-medium text-muted-foreground">{filteredTodos.length} items</span>
              </div>

              {isLoading ? (
                <div className="premium-card flex flex-col items-center justify-center rounded-2xl p-12 text-muted-foreground animate-pulse">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                  Synching Workspace...
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center rounded-2xl p-16 text-center">
                  <div className="mb-4 rounded-full bg-secondary/50 p-4">
                    <ListTodo className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold">No tasks found</p>
                  <p className="max-w-[240px] text-sm text-muted-foreground mt-1">
                    {searchQuery ? "Try adjusting your search query or filters." : "Your workspace is clear! Time to relax or start something new."}
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {filteredTodos.map((todo) => (
                    <li
                      key={todo.id}
                      className={`premium-card group relative flex items-start gap-4 p-4 ${todo.completed ? "opacity-75 grayscale-[0.5]" : ""
                        }`}
                    >
                      <div className="flex h-full flex-col items-center pt-1.5">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={(checked) =>
                            toggleTodo.mutate({ id: todo.id, completed: checked === true })
                          }
                          className="h-5 w-5 rounded-md border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                        />
                        <div className={`mt-2 flex-1 w-0.5 rounded-full ${todo.priority === "high" ? "bg-rose-400" : todo.priority === "medium" ? "bg-amber-400" : "bg-sky-400"
                          }`} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-lg font-semibold leading-tight tracking-tight ${todo.completed ? "text-muted-foreground line-through decoration-primary/40" : "text-foreground"
                              }`}
                          >
                            {todo.title}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`rounded-md border-none px-2 py-0 text-[10px] font-bold uppercase ${todo.priority === "high" ? "bg-rose-100 text-rose-600" :
                              todo.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-sky-100 text-sky-600"
                              }`}
                          >
                            {todo.priority}
                          </Badge>
                          {todo.category && (
                            <Badge variant="outline" className="border-border/50 bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground">
                              {todo.category}
                            </Badge>
                          )}
                        </div>

                        {todo.description && (
                          <p className="text-sm text-muted-foreground/80 leading-relaxed">
                            {todo.description}
                          </p>
                        )}

                        {todo.due_date && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Due {new Date(todo.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100"
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
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-12 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/40">
        FocusFlow &copy; {new Date().getFullYear()} &bull; Stay Driven
      </footer>
    </div>
  );
};

export default TodoList;
