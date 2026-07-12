import { Outlet } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 px-5 backdrop-blur md:px-8"><div className="relative hidden w-72 md:block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search vehicles, drivers, trips..." /></div><div className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground"><Bell className="h-4 w-4" /></div></header>
        <div className="p-5 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
