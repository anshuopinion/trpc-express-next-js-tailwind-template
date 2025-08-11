import { z } from "zod";

const validateEmailSchema = z.object({
  email: z.string(),
});

export const validateEmail = (input: z.infer<typeof validateEmailSchema>) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    email: input.email,
    isValid: emailRegex.test(input.email),
  };
};

export { validateEmailSchema };
