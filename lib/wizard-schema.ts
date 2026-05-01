import { z } from "zod";

export const step0Schema = z.object({
  personName: z
    .string()
    .min(1, "Please enter their name")
    .max(80, "Name too long"),
  birthDate: z
    .string()
    .min(1, "Please enter a birthday date")
    .max(60, "Too long"),
});

export const step3Schema = z
  .object({
    adminPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.adminPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type Step0Data = z.infer<typeof step0Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
