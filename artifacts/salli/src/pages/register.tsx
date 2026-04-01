import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data: { displayName: data.displayName, email: data.email, password: data.password } },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (error) => {
          toast({
            title: "Registration failed",
            description: error.data?.error || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-3xl shadow-xl border border-primary/20">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="mt-2 text-3xl font-serif font-bold tracking-tight text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Begin your journey with Salli
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              type="text"
              autoComplete="name"
              required
              className="mt-1"
              data-testid="input-display-name"
              {...form.register("displayName")}
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.displayName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1"
              data-testid="input-email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1"
              data-testid="input-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1"
              data-testid="input-confirm-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full mt-6"
            disabled={registerMutation.isPending}
            data-testid="button-register"
          >
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm pt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:text-primary/80" data-testid="link-login">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
