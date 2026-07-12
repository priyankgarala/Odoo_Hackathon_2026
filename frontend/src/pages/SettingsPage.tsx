import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, type Role } from "@/types";
import { Check } from "lucide-react";
import toast from "react-hot-toast";

const roles: Role[] = ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

const matrix: Record<Role, { fleet: boolean; drivers: boolean; trips: boolean; finances: boolean; settings: boolean }> = {
  FLEET_MANAGER: { fleet: true, drivers: true, trips: true, finances: true, settings: true },
  SAFETY_OFFICER: { fleet: false, drivers: true, trips: false, finances: false, settings: false },
  DRIVER: { fleet: false, drivers: false, trips: true, finances: false, settings: false },
  FINANCIAL_ANALYST: { fleet: false, drivers: false, trips: false, finances: true, settings: false },
};

export function SettingsPage() {
  const [role, setRole] = useState<Role>("FLEET_MANAGER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("User added successfully (mock)");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 border-l-4 border-orange-500 pl-4">Settings & RBAC</h1>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ADD USER</h2>
          
          <Card className="shadow-sm border-muted">
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SELECT ROLE</Label>
                  <select 
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">FULL NAME</Label>
                  <Input className="h-11" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LOGIN EMAIL</Label>
                  <Input className="h-11" type="email" placeholder="jane@transitops.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PASSWORD</Label>
                  <Input className="h-11" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-8 shadow-sm transition-colors">
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ROLE-BASED ACCESS LIMITS</h2>
          
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b bg-muted/30">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4 pl-6">ROLE</th>
                    <th className="p-4 text-center">FLEET</th>
                    <th className="p-4 text-center">DRIVERS</th>
                    <th className="p-4 text-center">TRIPS</th>
                    <th className="p-4 text-center">FINANCES</th>
                    <th className="p-4 text-center pr-6">SETTINGS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roles.map((r) => (
                    <tr key={r} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 pl-6 font-medium text-base">{ROLE_LABELS[r]}</td>
                      <td className="p-4 text-center">{matrix[r].fleet && <Check className="h-4 w-4 mx-auto text-emerald-500" />}</td>
                      <td className="p-4 text-center">{matrix[r].drivers && <Check className="h-4 w-4 mx-auto text-emerald-500" />}</td>
                      <td className="p-4 text-center">{matrix[r].trips && <Check className="h-4 w-4 mx-auto text-emerald-500" />}</td>
                      <td className="p-4 text-center">{matrix[r].finances && <Check className="h-4 w-4 mx-auto text-emerald-500" />}</td>
                      <td className="p-4 text-center pr-6">{matrix[r].settings && <Check className="h-4 w-4 mx-auto text-emerald-500" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
