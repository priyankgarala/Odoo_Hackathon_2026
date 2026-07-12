import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bus, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
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

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500"><Bus className="h-5 w-5" /></span><div><h1 className="text-xl font-bold">TransitOps</h1><p className="text-xs text-slate-400">Smart transport operations</p></div></div>
        <div className="relative z-10 my-auto max-w-lg"><span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-blue-300"><ShieldCheck className="h-4 w-4" /> Secure fleet control</span><h2 className="text-5xl font-bold leading-tight">Keep every journey on track.</h2><p className="mt-5 text-lg leading-8 text-slate-400">One workspace for your vehicles, drivers, dispatches, maintenance, and operational costs.</p><ul className="mt-10 space-y-4 text-sm text-slate-300"><li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Live fleet visibility</li><li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Role-based operations</li><li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Safe dispatch validation</li></ul></div>
        <div className="absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" /><p className="relative z-10 text-xs text-slate-500">TransitOps © 2026</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
      <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-slate-200/60">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary lg:hidden"><Bus className="h-5 w-5" /></div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your transport operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
            Setting up TransitOps for the first time?{" "}
            <Link className="font-medium text-primary hover:underline" to="/register">
              Create the first admin account
            </Link>
          </p>
        </CardContent>
      </Card>
      </section>
    </div>
  );
}
