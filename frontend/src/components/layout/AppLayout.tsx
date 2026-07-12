import { Outlet } from "react-router-dom";
import { Radio } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-5 backdrop-blur md:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <Radio className="h-3.5 w-3.5" /> Live Updates
        </div>
        </header>
        <div className="p-5 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
