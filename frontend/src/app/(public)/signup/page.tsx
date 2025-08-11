"use client";
import Link from "next/link";
import AuthLayout from "@/layout/auth-layout/auth-layout";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordField } from "@/components/forms";

// Import modular components and hooks
import {
  SignupForm,
  NameFields,
  SignupButton,
  ConfirmPasswordField,
} from "./_components";
import {
  useSignupForm,
  useSignupMutation,
  useMultiplePasswordToggle,
} from "./_hooks";

function Signup() {
  // Use modular hooks
  const form = useSignupForm();
  const { handleSignup, isPending } = useSignupMutation();
  const {
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
  } = useMultiplePasswordToggle();

  return (
    <AuthLayout>
      <SignupForm form={form} onSubmit={handleSignup}>
        <NameFields form={form} />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          showPassword={showPassword}
          onToggle={togglePassword}
          autoComplete="new-password"
        />

        <ConfirmPasswordField
          form={form}
          showPassword={showConfirmPassword}
          onToggle={toggleConfirmPassword}
        />

        <SignupButton isPending={isPending} />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link
            href="/signin"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </SignupForm>
    </AuthLayout>
  );
}

export default Signup;
