import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(164_35%_84%_/_0.28),transparent_38%),radial-gradient(circle_at_85%_15%,hsl(17_90%_84%_/_0.28),transparent_45%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">404 Error</p>
        <h1 className="mt-2 text-5xl font-bold">Page Not Found</h1>
        <p className="mt-3 text-muted-foreground">The page you requested does not exist or may have been moved.</p>
        <a
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};



export default NotFound;
