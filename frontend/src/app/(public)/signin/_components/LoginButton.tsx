import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginButtonProps {
  isPending: boolean;
}

export function LoginButton({ isPending }: LoginButtonProps) {
  return (
    <Button
      className="w-full font-medium"
      variant="default"
      type="submit"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}
