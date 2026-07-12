import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { registerUser } from "@/api/auth";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"], message: "Passwords do not match",
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, role: "FLEET_MANAGER" });
      await login(data.email, data.password);
      toast.success("Administrator account created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
    }
  }

  return <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <CardTitle>Set up TransitOps</CardTitle>
        <CardDescription>Create the first Fleet Manager account. This setup is available only until the first account is created.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full name" error={errors.name?.message}><Input autoComplete="name" {...register("name")} /></FormField>
          <FormField label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="admin@company.com" {...register("email")} /></FormField>
          <FormField label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")} /></FormField>
          <FormField label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" {...register("confirmPassword")} /></FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create administrator account"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" to="/login">Sign in</Link></p>
      </CardContent>
    </Card>
  </div>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm text-destructive">{error}</p>}</div>;
}
