import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { CheckCircle2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Confirmation Sent", description: "Please check your email to activate your account." });
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl text-foreground">FocusFlow</h1>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mt-1">Productivity Reimagined</p>
          </div>
        </div>

        <Card className="premium-card w-full p-8 border-none bg-white/40 dark:bg-black/40">
          <CardHeader className="space-y-1 p-0 pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium">
              {isSignUp ? "Join us and start shipping today." : "Log in to your productivity hub."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-none bg-secondary/50 focus-visible:ring-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 border-none bg-secondary/50 focus-visible:ring-primary/40"
                />
              </div>
              <Button type="submit" className="h-12 w-full text-sm font-bold shadow-lg shadow-primary/20 rounded-xl mt-2" disabled={loading}>
                {loading ? "Authenticating..." : isSignUp ? "GET STARTED" : "SIGN IN"}
              </Button>
            </form>

            <div className="mt-8 flex flex-col items-center border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground mb-1">
                {isSignUp ? "Already have an account?" : "New to FocusFlow?"}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-primary hover:underline underline-offset-4"
              >
                {isSignUp ? "Login to your workspace" : "Create a free account"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 text-center">
          Secure &bull; Encrypted &bull; Distributed
        </p>
      </div>
    </div>
  );
};

export default Auth;
