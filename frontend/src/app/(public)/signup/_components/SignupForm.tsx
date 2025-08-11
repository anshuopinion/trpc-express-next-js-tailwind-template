import type { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { SignupFormData } from "../_schema";

interface SignupFormProps {
  form: UseFormReturn<SignupFormData>;
  onSubmit: (values: SignupFormData) => void;
  children: React.ReactNode;
}

export function SignupForm({ form, onSubmit, children }: SignupFormProps) {
  return (
    <Card className="min-h-[410px] flex-1 p-8 shadow-lg">
      <div className="space-y-6 max-w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Join tRPC Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create your account to start building amazing applications
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
            {children}
          </form>
        </Form>
      </div>
    </Card>
  );
}
