import { NextResponse } from "next/server";
import { hasRecognizableCurrencyAmount, parseWithFallback } from "@/lib/fallback-parser";
import { BudgetResponseSchema, ParseBudgetRequestSchema, type BudgetResponse } from "@/lib/schemas";

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
Classify fixed obligations (rent, mortgage, utilities, insurance, minimum debt, transit pass) as "essential", variable necessities (groceries, gas, rideshares, household supplies) as "flexible", and lifestyle/dining/subscriptions/shopping as "want". Keep each "aiTip" concise (under 12 words). If no income is mentioned, set monthlyIncome to 0. Return ONLY valid JSON with no markdown fences or extra commentary.`;

function extractValidatedAiBudget(rawContent: string): BudgetResponse | null {
  try {
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const parsedJson = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));

    if (Array.isArray(parsedJson?.items)) {
      parsedJson.items = parsedJson.items.map(
        (item: Record<string, unknown>, idx: number) => ({
          ...item,
          id:
            item?.id !== undefined &&
            item?.id !== null &&
            String(item.id).trim() !== ""
              ? String(item.id)
              : `ai-item-${idx + 1}`,
          baselineAmount:
            typeof item?.baselineAmount === "string"
              ? parseFloat(item.baselineAmount.replace(/[^0-9.]/g, ""))
              : item?.baselineAmount,
          aiTip: typeof item?.aiTip === "string" ? item.aiTip : "",
        })
      );
    }

    const validated = BudgetResponseSchema.safeParse({
      ...parsedJson,
      parserSource: "ai",
    });

    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

async function callOpenRouterModel(
  apiKey: string,
  model: string,
  rawInput: string,
  timeoutMs: number
): Promise<BudgetResponse> {
  const isFreeOrNemotron =
    model.includes("nemotron") || model.endsWith(":free");

  const payload: Record<string, unknown> = {
    model,
    temperature: 0.1,
    max_tokens: 900,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: rawInput },
    ],
  };

  if (isFreeOrNemotron) {
    payload.reasoning = { effort: "none", exclude: true };
  } else {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "PulseLedger",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string") {
    throw new Error("Empty OpenRouter message content");
  }

  const validated = extractValidatedAiBudget(rawContent);
  if (!validated) {
    throw new Error("OpenRouter JSON failed schema validation");
  }

  return validated;
}

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

    const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(
      /^["']|["']$/g,
      ""
    );
    const configuredModel =
      process.env.OPENROUTER_MODEL?.trim().replace(/^["']|["']$/g, "") ||
      "openai/gpt-4o-mini";

    if (apiKey) {
      try {
        if (configuredModel.endsWith(":free")) {
          const candidateModels = Array.from(
            new Set([
              configuredModel,
              "nvidia/nemotron-3.5-lightning:free",
              "dots-studio/dots-3-note-preview:free",
            ])
          );
          const aiResult = await Promise.any(
            candidateModels.map((model) =>
              callOpenRouterModel(apiKey, model, rawInput, 12000)
            )
          );
          return NextResponse.json(aiResult, { status: 200 });
        } else {
          const aiResult = await callOpenRouterModel(
            apiKey,
            configuredModel,
            rawInput,
            10000
          );
          return NextResponse.json(aiResult, { status: 200 });
        }
      } catch {
        // Fall through to deterministic fallback parser if all OpenRouter candidates time out or error
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
