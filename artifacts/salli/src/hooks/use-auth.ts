import { useGetMe } from "@workspace/api-client-react";

export function useAuth() {
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
    }
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
