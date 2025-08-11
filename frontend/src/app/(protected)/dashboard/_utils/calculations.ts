import type { CardVariant } from "../_types";

export const getStatusColor = (status: string): "success" | "warning" | "error" => {
  switch (status.toLowerCase()) {
    case "healthy":
    case "active":
    case "online":
      return "success";
    case "warning":
    case "pending":
      return "warning";
    case "error":
    case "offline":
    case "failed":
      return "error";
    default:
      return "success";
  }
};

export const getCardVariant = (type: "user" | "server" | "app"): CardVariant => {
  switch (type) {
    case "user":
      return {
        bgColor: "bg-blue-50 border-blue-200",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
      };
    case "server":
      return {
        bgColor: "bg-green-50 border-green-200",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
      };
    case "app":
      return {
        bgColor: "bg-purple-50 border-purple-200",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
      };
    default:
      return {
        bgColor: "bg-gray-50 border-gray-200",
        iconColor: "text-gray-600",
        borderColor: "border-gray-200",
      };
  }
};

export const calculateUptimePercentage = (uptime: number): number => {
  // Assuming 24 hours = 100% uptime
  const dayInSeconds = 24 * 60 * 60;
  return Math.min((uptime / dayInSeconds) * 100, 100);
};

export const getVerificationStatus = (
  isEmailVerified: boolean
): {
  status: "verified" | "unverified";
  label: string;
  color: string;
} => {
  return isEmailVerified
    ? {
        status: "verified",
        label: "Verified Account",
        color: "text-green-600",
      }
    : {
        status: "unverified",
        label: "Unverified Account",
        color: "text-yellow-600",
      };
};
