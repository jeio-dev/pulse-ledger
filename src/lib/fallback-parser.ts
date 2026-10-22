import { PRESET_SCENARIOS } from "./presets";
import type { BudgetResponse, ExpenseCategory } from "./schemas";

const CURRENCY_NUMBER_REGEX =
  /(?:[$£€¥]\s*\d[\d,]*(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\s*(?:dollars?|usd|bucks|\/mo|a month|per month)\b|\b\d{2,6}(?:,\d{3})*(?:\.\d{1,2})?\b)/i;

export function hasRecognizableCurrencyAmount(rawInput: string): boolean {
  return CURRENCY_NUMBER_REGEX.test(rawInput);
}

interface KeywordRule {
  category: ExpenseCategory;
  keywords: RegExp;
  defaultLabel?: string;
  tip: string;
}

const INCOME_KEYWORDS =
  /\b(income|salary|take[-\s]?home|paid|paycheck|retainers?|freelance\s+client|brought\s+in|pulled\s+in|day\s+job\s+pays|side[-\s]?hustle\s+brought|earn|earned|make|making|net\s+pay|monthly\s+pay)\b/i;

const TOTAL_INCOME_SUMMARY = /\b(total\s+income|combined\s+income)\b/i;

const EXPENSE_RULES: KeywordRule[] = [
  {
    category: "essential",
    keywords: /\b(rent|mortgage|lease|housing|building\s+fee|coworking)\b/i,
    tip: "Fixed housing or workspace obligation locked at 100% baseline.",
  },
  {
    category: "essential",
    keywords: /\b(utilit(?:y|ies)|electric(?:ity)?|water|heat|power|internet|fiber|broadband|wifi|phone|mobile)\b/i,
    tip: "Fixed utility and connectivity baseline.",
  },
  {
    category: "essential",
    keywords: /\b(insurance|health|dental|medical|auto\s+insurance|car\s+payment|loan|debt|tuition|minimum|transit\s+pass|accounting|property\s+tax)\b/i,
    tip: "Essential recurring coverage or debt servicing obligation.",
  },
  {
    category: "flexible",
    keywords: /\b(grocer(?:y|ies)|supermarket|market|meal\s+prep|bulk\s+club|food\s+shopping)\b/i,
    tip: "Planning a weekly list and buying store-brand staples typically saves 15–20%.",
  },
  {
    category: "flexible",
    keywords: /\b(gas|fuel|uber|lyft|rideshares?|commute|client\s+travel|parking|tolls)\b/i,
    tip: "Combining errands and swapping peak rideshares for transit can trim 25–30%.",
  },
  {
    category: "flexible",
    keywords: /\b(household|pharmacy|supplies|pet|filament|packaging|restock|basics|toiletries)\b/i,
    tip: "Consolidating restocks into scheduled monthly orders reduces impulse add-ons.",
  },
  {
    category: "want",
    keywords: /\b(dining|restaurants?|takeout|delivery|doordash|ubereats|burgers|drinks|bars?|nightlife)\b/i,
    tip: "Replacing two delivery or restaurant nights a month with home meals recovers $90–$140/mo.",
  },
  {
    category: "want",
    keywords: /\b(coffee|cafe|espresso|latte|snacks?|vending|energy\s+drinks?|convenience\s+store)\b/i,
    tip: "Brewing at home and buying multipack snacks cuts daily convenience markups by 60%.",
  },
  {
    category: "want",
    keywords: /\b(subscriptions?|streaming|netflix|spotify|saas|apps?|gaming|memberships?)\b/i,
    tip: "Audit recurring billing and pause any service unused in the past 14 days.",
  },
  {
    category: "want",
    keywords: /\b(shopping|impulse|clothes|apparel|gear|upgrades?|gpu|keyboard|pc|camera|electronics|entertainment|hobbies)\b/i,
    tip: "Apply a 48-hour cooling period on non-essential purchases to cut impulse spend in half.",
  },
];

function cleanLabel(rawClause: string): string {
  const cleaned = rawClause
    .replace(/[$£€¥]\s*\d[\d,]*(?:\.\d{1,2})?/g, "")
    .replace(/\b\d[\d,]*(?:\.\d{1,2})?\s*(?:dollars?|usd|bucks|\/mo|a month|per month)?\b/gi, "")
    .replace(
      /\b(fixed\s+bills|fixed\s+essentials|variable\s+necessities|flexible\s+living(?:\s+costs)?|discretionary\s+leaks|wants|lately\s+i've\s+been\s+leaking\s+cash\s+on|spent|runs?|is|was|around|about|plus|and|on|for|in|a\s+month|per\s+month|monthly)\b/gi,
      " "
    )
    .replace(/[:;,.()-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "General Expense";
  }

  return cleaned
    .split(" ")
    .slice(0, 5)
    .map((word) =>
      word.length <= 2 && /^(to|of|in|on|at|by|&)$/i.test(word)
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function classifyClause(clause: string): { category: ExpenseCategory; tip: string } {
  for (const rule of EXPENSE_RULES) {
    if (rule.keywords.test(clause)) {
      return { category: rule.category, tip: rule.tip };
    }
  }
  return {
    category: "want",
    tip: "Trimming discretionary spend here by 20% immediately boosts your daily safe buffer.",
  };
}

export function parseWithFallback(rawInput: string): BudgetResponse {
  const normalizedInput = rawInput.trim();

  // 1. Exact or near-exact preset match
  const matchedPreset = PRESET_SCENARIOS.find(
    (preset) => preset.rawInput.trim().toLowerCase() === normalizedInput.toLowerCase()
  );
  if (matchedPreset) {
    return {
      ...matchedPreset.fallbackResponse,
      parserSource: "fallback",
    };
  }

  // Detect currency symbol
  const symbolMatch = normalizedInput.match(/([$£€¥])/);
  const currencySymbol = symbolMatch ? symbolMatch[1] : "$";

  // Remove parenthetical total income summaries like "($3,550 total income)" so we don't double-count
  const cleanedText = normalizedInput.replace(/\([^)]*total\s+income[^)]*\)/gi, "");

  // Split into clauses by sentence boundaries, semicolons, newlines, commas, or "plus"
  const rawClauses = cleanedText
    .split(/(?:[\n;.]|,\s+(?=(?:plus\s+|and\s+)?[a-zA-Z$£€¥0-9])|\bplus\b)/i)
    .map((c) => c.trim())
    .filter(Boolean);

  let monthlyIncome = 0;
  const items: BudgetResponse["items"] = [];
  let itemCounter = 1;

  for (const clause of rawClauses) {
    // Find all dollar/numeric figures in the clause
    const amountMatches = [
      ...clause.matchAll(/(?:[$£€¥]\s*(\d[\d,]*(?:\.\d{1,2})?)|(\d[\d,]*(?:\.\d{1,2})?)\s*(?:dollars?|usd|bucks|\/mo|a month|per month)?)/gi),
    ];

    if (amountMatches.length === 0) continue;

    // Check if this clause has an explicit expense keyword; if not and it matches income keywords, treat as income
    const hasExpenseKeyword = EXPENSE_RULES.some((r) => r.keywords.test(clause));
    const isIncomeClause = INCOME_KEYWORDS.test(clause) && !hasExpenseKeyword;

    if (isIncomeClause) {
      if (TOTAL_INCOME_SUMMARY.test(clause) && monthlyIncome > 0) {
        continue;
      }
      for (const match of amountMatches) {
        const rawNum = (match[1] || match[2] || "").replace(/,/g, "");
        const val = parseFloat(rawNum);
        if (!Number.isNaN(val) && val > 0) {
          monthlyIncome += Math.round(val);
        }
      }
      continue;
    }

    // Otherwise, parse as one or more expense segments within this clause
    const subClauses =
      amountMatches.length > 1
        ? clause.split(/\band\b/i).map((s) => s.trim()).filter(Boolean)
        : [clause];

    for (const sub of subClauses) {
      const subMatch = sub.match(
        /(?:[$£€¥]\s*(\d[\d,]*(?:\.\d{1,2})?)|(\d[\d,]*(?:\.\d{1,2})?))/i
      );
      if (!subMatch) continue;

      const rawNum = (subMatch[1] || subMatch[2] || "").replace(/,/g, "");
      const amount = Math.round(parseFloat(rawNum));
      if (Number.isNaN(amount) || amount <= 0) continue;

      // Double-check if the subClause itself is an income statement (e.g. "I make $3000 and rent is $1200")
      const subHasExpense = EXPENSE_RULES.some((r) => r.keywords.test(sub));
      if (INCOME_KEYWORDS.test(sub) && !subHasExpense) {
        monthlyIncome += amount;
        continue;
      }

      const { category, tip } = classifyClause(sub);
      const label = cleanLabel(sub);

      items.push({
        id: `item-${itemCounter++}`,
        label,
        category,
        baselineAmount: amount,
        aiTip: tip,
      });
    }
  }

  // If the user only typed a single number or income-only text without clear expense clauses, ensure at least 1 item exists
  if (items.length === 0 && monthlyIncome > 0) {
    items.push({
      id: "item-1",
      label: "General Living Expenses",
      category: "flexible",
      baselineAmount: Math.round(monthlyIncome * 0.7),
      aiTip: "Break down individual expenses like rent, groceries, and dining for granular What-If sliders.",
    });
  }

  return {
    monthlyIncome,
    currencySymbol,
    parserSource: "fallback",
    items,
  };
}
