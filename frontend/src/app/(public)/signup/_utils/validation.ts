export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  message: string;
  strength: "weak" | "medium" | "strong";
} => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
      strength: "weak",
    };
  }

  if (password.length < 8) {
    return {
      isValid: true,
      message: "Password is acceptable",
      strength: "weak",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (strengthScore >= 3 && password.length >= 12) {
    return {
      isValid: true,
      message: "Strong password",
      strength: "strong",
    };
  }

  if (strengthScore >= 2 && password.length >= 8) {
    return {
      isValid: true,
      message: "Medium strength password",
      strength: "medium",
    };
  }

  return {
    isValid: true,
    message: "Password could be stronger",
    strength: "weak",
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
