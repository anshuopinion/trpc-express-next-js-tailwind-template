"use client";
import Link from "next/link";
import { PasswordField } from "@/components/forms";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/layout/auth-layout/auth-layout";

// Import modular components and hooks
import { LoginButton, SigninForm } from "./_components";
import { usePasswordToggle, useSigninForm, useSigninMutation } from "./_hooks";

function SigninPage() {
  // Use modular hooks
  const form = useSigninForm();
  const { handleSignin, isPending } = useSigninMutation();
  const { showPassword, togglePassword } = usePasswordToggle();

  return (
    <AuthLayout>
      <SigninForm form={form} onSubmit={handleSignin}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="name@example.com" autoComplete="email" />
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
          forgotPasswordLink={
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          }
        />

        <LoginButton isPending={isPending} />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one now
          </Link>
        </div>
      </SigninForm>
    </AuthLayout>
  );
}

export default SigninPage;
