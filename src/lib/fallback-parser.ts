import { PRESET_SCENARIOS } from "./presets";
import type { BudgetResponse, ExpenseCategory } from "./schemas";

const CURRENCY_NUMBER_REGEX =
  /(?:[$£€¥₱₹₩₫฿]\s*\d[\d,]*(?:\.\d{1,2})?|\b(?:php|usd|eur|gbp|jpy|inr|p)\s*\d[\d,]*(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\s*(?:dollars?|usd|bucks|pesos?|php|ph\s+pesos?|\/mo|a month|per month)\b|\b\d{2,7}(?:,\d{3})*(?:\.\d{1,2})?\b)/i;

export function hasRecognizableCurrencyAmount(rawInput: string): boolean {
  return CURRENCY_NUMBER_REGEX.test(rawInput);
}

export function detectCurrencySymbol(
  rawInput: string,
  modelSuggestedSymbol?: string
): string {
  const text = rawInput.trim();

  // Check explicit Philippine Peso symbols, ISO codes, or words in user input
  if (
    /₱|\b(?:php|pesos?|ph\s+pesos?|philippine\s+pesos?)\b|(?:^|[\s,(])P\s*\d[\d,]*/i.test(
      text
    )
  ) {
    return "₱";
  }

  // Check explicit currency character in user input
  const charMatch = text.match(/([₱€£¥₹₩₫฿$])/);
  if (charMatch) {
    return charMatch[1];
  }

  // Check common currency words/codes in user input
  if (/\b(?:eur|euros?)\b/i.test(text)) return "€";
  if (/\b(?:gbp|pounds?|sterling)\b/i.test(text)) return "£";
  if (/\b(?:jpy|yen)\b/i.test(text)) return "¥";
  if (/\b(?:inr|rupees?)\b/i.test(text)) return "₹";
  if (/\b(?:krw|won)\b/i.test(text)) return "₩";

  // Normalize model-suggested symbol if provided
  if (typeof modelSuggestedSymbol === "string" && modelSuggestedSymbol.trim()) {
    const s = modelSuggestedSymbol.trim();
    if (/^(?:₱|php|peso|pesos|ph\s*peso|p)$/i.test(s)) return "₱";
    if (/^(?:€|eur|euro|euros)$/i.test(s)) return "€";
    if (/^(?:£|gbp|pound|pounds)$/i.test(s)) return "£";
    if (/^(?:¥|jpy|yen)$/i.test(s)) return "¥";
    if (/^(?:₹|inr|rupee|rupees)$/i.test(s)) return "₹";
    if (/^(?:₩|krw|won)$/i.test(s)) return "₩";
    if (s.length <= 3) return s;
  }

  return "$";
}

interface KeywordRule {
  category: ExpenseCategory;
  keywords: RegExp;
  defaultLabel?: string;
  tip: string;
}

const INCOME_KEYWORDS =
  /\b(income|salary|take[-\s]?home|paid|paycheck|retainers?|freelance\s+client|brought\s+in|pulled\s+in|day\s+job\s+pays|side[-\s]?hustle\s+brought|earn|earned|make|making|net\s+pay|monthly\s+pay|sweldo|sahod)\b/i;

const TOTAL_INCOME_SUMMARY = /\b(total\s+income|combined\s+income)\b/i;

const EXPENSE_RULES: KeywordRule[] = [
  {
    category: "essential",
    keywords: /\b(rent|mortgage|lease|housing|building\s+fee|condo\s+dues|assoc(?:iation)?\s+dues|coworking)\b/i,
    tip: "Fixed housing or workspace obligation locked at 100% baseline.",
  },
  {
    category: "essential",
    keywords: /\b(utilit(?:y|ies)|electric(?:ity)?|meralco|water|maynilad|manila\s+water|heat|power|internet|fiber|pldt|globe|converge|broadband|wifi|phone|mobile|postpaid)\b/i,
    tip: "Fixed utility and connectivity baseline.",
  },
  {
    category: "essential",
    keywords: /\b(insurance|health|hmo|dental|medical|auto\s+insurance|car\s+payment|loan|debt|tuition|minimum|transit\s+pass|accounting|property\s+tax)\b/i,
    tip: "Essential recurring coverage or debt servicing obligation.",
  },
  {
    category: "flexible",
    keywords: /\b(grocer(?:y|ies)|supermarket|market|palengke|meal\s+prep|bulk\s+club|food\s+shopping)\b/i,
    tip: "Planning a weekly list and buying store-brand staples typically saves 15–20%.",
  },
  {
    category: "flexible",
    keywords: /\b(gas|fuel|uber|lyft|grab|angkas|joyride|rideshares?|commute|client\s+travel|parking|tolls)\b/i,
    tip: "Combining errands and swapping peak rideshares for transit can trim 25–30%.",
  },
  {
    category: "flexible",
    keywords: /\b(household|pharmacy|watsons|mercury\s+drug|supplies|pet|filament|packaging|restock|basics|toiletries)\b/i,
    tip: "Consolidating restocks into scheduled monthly orders reduces impulse add-ons.",
  },
  {
    category: "want",
    keywords: /\b(dining|restaurants?|takeout|delivery|doordash|ubereats|grabfood|foodpanda|burgers|drinks|bars?|nightlife)\b/i,
    tip: "Replacing two delivery or restaurant nights a month with home meals cuts dining leaks by 30–40%.",
  },
  {
    category: "want",
    keywords: /\b(coffee|cafe|espresso|latte|milk\s+tea|snacks?|vending|energy\s+drinks?|convenience\s+store|7[-\s]?eleven)\b/i,
    tip: "Brewing at home and buying multipack snacks cuts daily convenience markups by 60%.",
  },
  {
    category: "want",
    keywords: /\b(subscriptions?|streaming|netflix|spotify|youtube|saas|apps?|gaming|memberships?)\b/i,
    tip: "Audit recurring billing and pause any service unused in the past 14 days.",
  },
  {
    category: "want",
    keywords: /\b(shopping|shopee|lazada|tiktok\s+shop|impulse|clothes|apparel|gear|upgrades?|gpu|keyboard|pc|camera|electronics|entertainment|hobbies)\b/i,
    tip: "Apply a 48-hour cooling period on non-essential checkouts to cut impulse spend in half.",
  },
];

function cleanLabel(rawClause: string): string {
  const cleaned = rawClause
    .replace(/[$£€¥₱₹₩₫฿]\s*\d[\d,]*(?:\.\d{1,2})?/g, "")
    .replace(/\b(?:php|usd|eur|gbp|jpy|inr|p)\s*\d[\d,]*(?:\.\d{1,2})?/gi, "")
    .replace(
      /\b\d[\d,]*(?:\.\d{1,2})?\s*(?:dollars?|usd|bucks|philippine\s+pesos?|ph\s+pesos?|pesos?|php|\/mo|a month|per month)?\b/gi,
      ""
    )
    .replace(
      /\b(philippine\s+pesos?|ph\s+pesos?|pesos?|php|fixed\s+bills|fixed\s+essentials|variable\s+necessities|flexible\s+living(?:\s+costs)?|discretionary\s+leaks|wants|lately\s+i've\s+been\s+leaking\s+cash\s+on|spent|runs?|is|was|around|about|plus|and|on|for|in|a\s+month|per\s+month|monthly)\b/gi,
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

  // Detect currency symbol (₱, $, €, £, ¥, ₹, etc.)
  const currencySymbol = detectCurrencySymbol(normalizedInput);

  // Remove parenthetical total income summaries like "($3,550 total income)" so we don't double-count
  const cleanedText = normalizedInput.replace(/\([^)]*total\s+income[^)]*\)/gi, "");

  // Split into clauses by sentence boundaries, semicolons, newlines, commas, or "plus"
  const rawClauses = cleanedText
    .split(/(?:[\n;.]|,\s+(?=(?:plus\s+|and\s+)?[a-zA-Z$£€¥₱₹₩0-9])|\bplus\b)/i)
    .map((c) => c.trim())
    .filter(Boolean);

  let monthlyIncome = 0;
  const items: BudgetResponse["items"] = [];
  let itemCounter = 1;

  const AMOUNT_CAPTURE_GLOBAL =
    /(?:(?:[$£€¥₱₹₩₫฿]|\b(?:php|usd|eur|gbp|p))\s*(\d[\d,]*(?:\.\d{1,2})?)|(\d[\d,]*(?:\.\d{1,2})?)\s*(?:dollars?|usd|bucks|philippine\s+pesos?|ph\s+pesos?|pesos?|php|\/mo|a month|per month)?)/gi;

  const AMOUNT_CAPTURE_SINGLE =
    /(?:(?:[$£€¥₱₹₩₫฿]|\b(?:php|usd|eur|gbp|p))\s*(\d[\d,]*(?:\.\d{1,2})?)|(\d[\d,]*(?:\.\d{1,2})?))/i;

  for (const clause of rawClauses) {
    const amountMatches = [...clause.matchAll(AMOUNT_CAPTURE_GLOBAL)];

    if (amountMatches.length === 0) continue;

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

    const subClauses =
      amountMatches.length > 1
        ? clause.split(/\band\b/i).map((s) => s.trim()).filter(Boolean)
        : [clause];

    for (const sub of subClauses) {
      const subMatch = sub.match(AMOUNT_CAPTURE_SINGLE);
      if (!subMatch) continue;

      const rawNum = (subMatch[1] || subMatch[2] || "").replace(/,/g, "");
      const amount = Math.round(parseFloat(rawNum));
      if (Number.isNaN(amount) || amount <= 0) continue;

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
