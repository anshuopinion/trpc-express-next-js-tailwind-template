export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCredentials = (
  email: string,
  password: string,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push("Email is required");
  } else if (!validateEmailFormat(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!password.trim()) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
