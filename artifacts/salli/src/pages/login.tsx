import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (error) => {
          const message =
            (error as { data?: { error?: string } })?.data?.error ||
            t.auth.invalidCredentials;
          toast({
            title: t.auth.loginFailed,
            description: message,
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
            {t.auth.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.loginSubtitle}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                className={cn("mt-1", isRTL && "text-right")}
                data-testid="input-email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={cn("mt-1", isRTL && "text-right")}
                data-testid="input-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? t.auth.loggingIn : t.auth.loginButton}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t.auth.noAccount} </span>
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
              data-testid="link-register"
            >
              {t.auth.createAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
