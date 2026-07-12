import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bus,
  CircleDot,
  Fuel,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vehicles", label: "Vehicles", icon: Bus, roles: ["FLEET_MANAGER"] as const },
  { to: "/drivers", label: "Drivers", icon: Users, roles: ["SAFETY_OFFICER", "FLEET_MANAGER"] as const },
  { to: "/trips", label: "Trips", icon: Route, roles: ["FLEET_MANAGER"] as const },
  { to: "/my-trips", label: "My Trips", icon: Route, roles: ["DRIVER"] as const },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["FLEET_MANAGER"] as const },
  { to: "/fuel-expenses", label: "Fuel & Expenses", icon: Fuel, roles: ["FINANCIAL_ANALYST", "FLEET_MANAGER"] as const },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["FINANCIAL_ANALYST", "FLEET_MANAGER"] as const },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["FLEET_MANAGER"] as const },
];

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.some((role) => hasRole(role)),
  );

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-slate-950 text-slate-300">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-2 text-white"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500"><Bus className="h-4 w-4" /></span><h1 className="text-xl font-bold">TransitOps</h1></div>
        <p className="mt-2 text-xs text-slate-500">Smart transport operations</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-2"><CircleDot className="h-3 w-3 text-emerald-400" /><div>
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-500">
            {user ? ROLE_LABELS[user.role] : ""}
          </p></div></div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:bg-slate-800 hover:text-white" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
