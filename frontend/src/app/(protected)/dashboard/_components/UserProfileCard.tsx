import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User as UserType } from "../_types";
import { formatFullName, formatUserInitials, getVerificationStatus } from "../_utils";

interface UserProfileCardProps {
  user: UserType | null | undefined;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const verificationInfo = getVerificationStatus(user?.is_email_verified || false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">User Profile</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatFullName(user?.first_name, user?.last_name)}
        </div>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        <div className="mt-4 flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
            <span className="text-primary font-semibold text-sm">
              {formatUserInitials(user?.first_name, user?.last_name)}
            </span>
          </div>
          <span className={`text-sm ${verificationInfo.color}`}>{verificationInfo.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
