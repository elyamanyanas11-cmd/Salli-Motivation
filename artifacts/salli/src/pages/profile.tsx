import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      city: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName,
        city: user.city || "",
      });
    }
  }, [user, form]);

  if (isLoading || !user) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(
      { data: { displayName: data.displayName, city: data.city || null } },
      {
        onSuccess: (updatedUser) => {
          queryClient.setQueryData(getGetMeQueryKey(), updatedUser);
          toast({
            title: "Profile updated",
            description: "Your profile has been successfully updated.",
          });
        },
        onError: (error) => {
          toast({
            title: "Update failed",
            description: error.data?.error || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </header>

      <div className="glass rounded-3xl p-8 shadow-sm">
        <div className="mb-8 p-4 bg-muted/50 rounded-xl">
          <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-muted-foreground mt-2">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
        </div>

        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                className="mt-1"
                data-testid="input-profile-name"
                {...form.register("displayName")}
              />
              {form.formState.errors.displayName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.displayName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                className="mt-1"
                placeholder="e.g. London, Dubai, Jakarta"
                data-testid="input-profile-city"
                {...form.register("city")}
              />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="rounded-full"
            disabled={updateProfileMutation.isPending || !form.formState.isDirty}
            data-testid="button-profile-save"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
