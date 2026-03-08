import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  recipientName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  countryCode: z.string().length(2),
});

export type AddressInput = z.infer<typeof addressSchema>;
