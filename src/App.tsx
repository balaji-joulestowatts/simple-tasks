import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Todos from "@/pages/Todos";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todos/new" element={<Todos />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
