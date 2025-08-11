import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTRPC } from "@/trpc/client";
import type { SigninFormData } from "../_schema";

export function useSigninMutation() {
  const router = useRouter();
  const trpc = useTRPC();
  const { login } = useAuth();

  const signinMutation = useMutation(
    trpc.auth.signin.mutationOptions({
      onSuccess: (data) => {
        login(data);
        toast.success("Login successful", {
          description: "Redirecting to scanner dashboard...",
        });
        router.replace("/dashboard");
      },
      onError: (err) => {
        toast.error("Authentication failed", {
          description: err.message,
        });
      },
    })
  );

  const handleSignin = (values: SigninFormData) => {
    signinMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  return {
    signinMutation,
    handleSignin,
    isPending: signinMutation.isPending,
  };
}
