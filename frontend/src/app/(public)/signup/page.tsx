"use client";
import Link from "next/link";
import { PasswordField } from "@/components/forms";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/layout/auth-layout/auth-layout";

// Import modular components and hooks
import { ConfirmPasswordField, NameFields, SignupButton, SignupForm } from "./_components";
import { useMultiplePasswordToggle, useSignupForm, useSignupMutation } from "./_hooks";

function Signup() {
  // Use modular hooks
  const form = useSignupForm();
  const { handleSignup, isPending } = useSignupMutation();
  const { showPassword, showConfirmPassword, togglePassword, toggleConfirmPassword } =
    useMultiplePasswordToggle();

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
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/signin" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </SignupForm>
    </AuthLayout>
  );
}

export default Signup;
