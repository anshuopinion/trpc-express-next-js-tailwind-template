import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { SigninFormData } from "../_schema";

interface SigninFormProps {
  form: UseFormReturn<SigninFormData>;
  onSubmit: (values: SigninFormData) => void;
  children: React.ReactNode;
}

export function SigninForm({ form, onSubmit, children }: SigninFormProps) {
  return (
    <Card className="min-h-[410px] flex-1 p-8 shadow-lg">
      <div className="space-y-6 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back to Stock Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your scanner dashboard and monitor live market
            data
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {children}
          </form>
        </Form>
      </div>
    </Card>
  );
}
