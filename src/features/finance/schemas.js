import { z } from 'zod';

export const TRANSACTION_TYPES = ['income', 'expense'];

export const CATEGORIES = {
  income: ['Salary', 'Investment', 'Business', 'Other'],
  expense: [
    'Housing & Utilities',
    'Food & Survival',
    'Education & Investment',
    'Debt & Obligations',
    'Leisure & Lifestyle',
    'Other'
  ]
};

// Zod schema for client-side data validation
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    invalid_type_error: "Type must be either 'income' or 'expense'",
  }),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  description: z.string().max(255, "Description is too long").optional(),
}).superRefine((data, ctx) => {
  // Ensure the category selected is valid for the transaction type
  const validCategories = CATEGORIES[data.type];
  if (!validCategories.includes(data.category)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid category for type ${data.type}`,
      path: ['category'],
    });
  }
});
