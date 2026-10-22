import { z } from "zod";

export const ExpenseCategorySchema = z.enum(["essential", "flexible", "want"]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const ExpenseItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: ExpenseCategorySchema,
  baselineAmount: z.number().nonnegative(),
  sliderPercent: z.number().min(0).max(150), // Locked at 100 for "essential"
  simulatedAmount: z.number().nonnegative(), // Math.round((baselineAmount * sliderPercent) / 100)
  aiTip: z.string(),
});
export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

export const ParseBudgetRequestSchema = z.object({
  rawInput: z.string().trim().min(1, "Please enter your monthly income and expenses."),
});
export type ParseBudgetRequest = z.infer<typeof ParseBudgetRequestSchema>;

export const BudgetResponseSchema = z.object({
  monthlyIncome: z.number().nonnegative(),
  currencySymbol: z.string().default("$"),
  parserSource: z.enum(["ai", "fallback"]).default("fallback"),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        category: ExpenseCategorySchema,
        baselineAmount: z.number().nonnegative(),
        aiTip: z.string().default(""),
      })
    )
    .min(1),
});
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;

export const BudgetLedgerStateSchema = z.object({
  rawInput: z.string(),
  monthlyIncome: z.number().nonnegative(),
  currencySymbol: z.string().default("$"),
  parserSource: z.enum(["ai", "fallback"]).default("fallback"),
  items: z.array(ExpenseItemSchema),
});
export type BudgetLedgerState = z.infer<typeof BudgetLedgerStateSchema>;
