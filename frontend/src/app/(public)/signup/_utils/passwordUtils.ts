export const generatePasswordStrengthColor = (
  strength: "weak" | "medium" | "strong",
): string => {
  switch (strength) {
    case "weak":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "strong":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

export const generatePasswordStrengthBg = (
  strength: "weak" | "medium" | "strong",
): string => {
  switch (strength) {
    case "weak":
      return "bg-red-100 border-red-200";
    case "medium":
      return "bg-yellow-100 border-yellow-200";
    case "strong":
      return "bg-green-100 border-green-200";
    default:
      return "bg-gray-100 border-gray-200";
  }
};

export const passwordRequirements = [
  "At least 6 characters long",
  "Contains uppercase and lowercase letters",
  "Contains at least one number",
  "Contains at least one special character",
] as const;

export const checkPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};
