export const formatUptime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)} seconds`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days !== 1 ? "s" : ""}`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatUserInitials = (
  firstName?: string,
  lastName?: string,
): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return `${first}${last}` || "??";
};

export const formatFullName = (
  firstName?: string,
  lastName?: string,
): string => {
  return `${firstName || ""} ${lastName || ""}`.trim() || "Unknown User";
};

export const formatStatus = (status: string): string => {
  return status.toLowerCase() === "healthy" ? "healthy" : status;
};

export const formatVersion = (version: string): string => {
  return version.startsWith("v") ? version : `v${version}`;
};
