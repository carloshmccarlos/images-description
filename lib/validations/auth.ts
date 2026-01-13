import * as v from 'valibot';

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address')),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
});

export const registerSchema = v.pipe(
  v.object({
    email: v.pipe(v.string(), v.email('Please enter a valid email address')),
    password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.check((data) => data.password === data.confirmPassword, 'Passwords do not match'),
    ['confirmPassword']
  )
);

export const forgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address')),
});

export type LoginInput = v.InferInput<typeof loginSchema>;
export type RegisterInput = v.InferInput<typeof registerSchema>;
export type ForgotPasswordInput = v.InferInput<typeof forgotPasswordSchema>;
