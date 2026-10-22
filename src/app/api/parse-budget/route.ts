import { NextResponse } from "next/server";
import { hasRecognizableCurrencyAmount, parseWithFallback } from "@/lib/fallback-parser";
import { BudgetResponseSchema, ParseBudgetRequestSchema } from "@/lib/schemas";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Extract monthly cashflow into strict JSON matching:
{
  "monthlyIncome": number,
  "currencySymbol": "$",
  "items": [
    {
      "id": string,
      "label": string,
      "category": "essential" | "flexible" | "want",
      "baselineAmount": number,
      "aiTip": string
    }
  ]
}
Classify fixed obligations (rent, mortgage, utilities, insurance, minimum debt, transit pass) as "essential", variable necessities (groceries, gas, rideshares, household supplies) as "flexible", and lifestyle/dining/subscriptions/shopping as "want". Provide a concrete 1-line saving tip in "aiTip" for each item. If no income is mentioned, set monthlyIncome to 0.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsedReq = ParseBudgetRequestSchema.safeParse(body);

    if (!parsedReq.success) {
      return NextResponse.json(
        {
          error:
            parsedReq.error.issues[0]?.message ||
            "Please enter your monthly income and expenses.",
        },
        { status: 400 }
      );
    }

    const { rawInput } = parsedReq.data;

    if (!hasRecognizableCurrencyAmount(rawInput)) {
      return NextResponse.json(
        {
          error:
            "No dollar amounts detected. Include numbers like '$2,600 income, $1,150 rent' or click a preset pill above.",
        },
        { status: 422 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    const model = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini";

    if (apiKey) {
      try {
        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "PulseLedger",
          },
          body: JSON.stringify({
            model,
            response_format: { type: "json_object" },
            temperature: 0.1,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: rawInput },
            ],
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data?.choices?.[0]?.message?.content;
          if (typeof rawContent === "string") {
            const cleanedJson = rawContent
              .replace(/^```json\s*/i, "")
              .replace(/```\s*$/i, "")
              .trim();
            const parsedJson = JSON.parse(cleanedJson);
            const validated = BudgetResponseSchema.safeParse({
              ...parsedJson,
              parserSource: "ai",
            });

            if (validated.success) {
              return NextResponse.json(validated.data, { status: 200 });
            }
          }
        }
      } catch {
        // Fall through to deterministic fallback parser on timeout, network error, or invalid JSON
      }
    }

    const fallbackResult = parseWithFallback(rawInput);
    const validatedFallback = BudgetResponseSchema.parse(fallbackResult);
    return NextResponse.json(validatedFallback, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process cashflow text. Please try again." },
      { status: 500 }
    );
  }
}
