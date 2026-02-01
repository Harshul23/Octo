/* eslint-env node */
/**
 * AI Provider Abstraction for Serverless Functions
 * Supports Gemini, OpenAI, and Anthropic
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";

/**
 * Call Google Gemini API
 */
async function callGemini(systemPrompt, userPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Gemini API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Call OpenAI API
 */
async function callOpenAI(systemPrompt, userPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(systemPrompt, userPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Anthropic API error: ${error.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call the configured AI provider
 */
export async function callAI(systemPrompt, userPrompt) {
  if (AI_PROVIDER === "gemini" && GEMINI_API_KEY) {
    return callGemini(systemPrompt, userPrompt);
  } else if (AI_PROVIDER === "anthropic" && ANTHROPIC_API_KEY) {
    return callAnthropic(systemPrompt, userPrompt);
  } else if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    return callOpenAI(systemPrompt, userPrompt);
  } else if (GEMINI_API_KEY) {
    return callGemini(systemPrompt, userPrompt);
  } else if (OPENAI_API_KEY) {
    return callOpenAI(systemPrompt, userPrompt);
  } else if (ANTHROPIC_API_KEY) {
    return callAnthropic(systemPrompt, userPrompt);
  } else {
    throw new Error(
      "No AI API key configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.",
    );
  }
}

/**
 * Get AI configuration status
 */
export function getAIStatus() {
  const hasOpenAI = !!OPENAI_API_KEY;
  const hasAnthropic = !!ANTHROPIC_API_KEY;
  const hasGemini = !!GEMINI_API_KEY;

  const getActiveProvider = () => {
    if (AI_PROVIDER === "gemini" && hasGemini) return "gemini";
    if (AI_PROVIDER === "anthropic" && hasAnthropic) return "anthropic";
    if (AI_PROVIDER === "openai" && hasOpenAI) return "openai";
    if (hasGemini) return "gemini";
    if (hasOpenAI) return "openai";
    if (hasAnthropic) return "anthropic";
    return "none";
  };

  return {
    configured: hasOpenAI || hasAnthropic || hasGemini,
    provider: getActiveProvider(),
  };
}
