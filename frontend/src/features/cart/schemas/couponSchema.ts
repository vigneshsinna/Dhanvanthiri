import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(2).max(50),
});
