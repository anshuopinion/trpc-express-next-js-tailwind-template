import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignupButtonProps {
  isPending: boolean;
}

export function SignupButton({ isPending }: SignupButtonProps) {
  return (
    <Button className="w-full font-medium" type="submit" disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create account"
      )}
    </Button>
  );
}
