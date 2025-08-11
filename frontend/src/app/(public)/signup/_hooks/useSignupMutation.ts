import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { SignupFormData } from "../_schema";

export function useSignupMutation() {
  const router = useRouter();
  const trpc = useTRPC();

  const signupMutation = useMutation(
    trpc.auth.signup.mutationOptions({
      onSuccess: () => {
        toast.success("Account created successfully", {
          description: "You can now sign in and start using tRPC Template",
        });
        setTimeout(() => {
          router.push("/signin");
        }, 1500);
      },
      onError: (err) => {
        toast.error("Registration failed", {
          description: err.message,
        });
      },
    }),
  );

  const handleSignup = (values: SignupFormData) => {
    signupMutation.mutate({
      email: values.email,
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
    });
  };

  return {
    signupMutation,
    handleSignup,
    isPending: signupMutation.isPending,
  };
}
