import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bus } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, type Role } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const roles: Role[] = ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("FLEET_MANAGER");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome to TransitOps");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as Role;
    setSelectedRole(role);
    
    // Auto-fill demo credentials based on role
    const demoEmails: Record<Role, string> = {
      FLEET_MANAGER: "manager@transitops.com",
      DRIVER: "driver@transitops.com",
      SAFETY_OFFICER: "safety@transitops.com",
      FINANCIAL_ANALYST: "finance@transitops.com"
    };
    
    setValue("email", demoEmails[role]);
    setValue("password", "password123");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Light Grey */}
      <section className="relative hidden bg-slate-200 p-12 lg:flex lg:flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-200/50">
              <Bus className="h-7 w-7 text-orange-600" />
            </span>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">TransitOps</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Smart Transport Operations Platform</p>
          </div>

          <div className="mt-20">
            <h2 className="text-lg font-bold text-slate-800 mb-4">One login, four roles:</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="h-2 w-2 bg-orange-500"></span> Fleet Manager
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="h-2 w-2 bg-orange-500"></span> Driver
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="h-2 w-2 bg-orange-500"></span> Safety Officer
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="h-2 w-2 bg-orange-500"></span> Financial Analyst
              </li>
            </ul>
          </div>
        </div>
        
        <p className="text-xs font-medium text-slate-500">Version 1.0.0.0 - Odoo Auth</p>
      </section>

      {/* Right Side - Dark */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-400 mt-2">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">EMAIL</Label>
              <Input 
                id="email" 
                type="email" 
                className="h-12 bg-slate-900 border-slate-800 text-white focus-visible:ring-orange-500 focus-visible:ring-offset-slate-950 placeholder:text-slate-600" 
                placeholder="manager@transitops.com" 
                {...register("email")} 
              />
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">PASSWORD</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 bg-slate-900 border-slate-800 text-white focus-visible:ring-orange-500 focus-visible:ring-offset-slate-950 placeholder:text-slate-600" 
                placeholder="••••••••••••"
                {...register("password")} 
              />
              {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-slate-400">SELECT ROLE</Label>
              <select 
                id="role"
                className="flex h-12 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" 
                value={selectedRole}
                onChange={handleRoleChange}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-950" />
                <label htmlFor="remember" className="text-sm text-slate-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold transition-colors" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
