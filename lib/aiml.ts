const AIML_BASE_URL = process.env.AIML_BASE_URL ?? "https://api.aimlapi.com/v1";
const AIML_MODEL = process.env.AIML_MODEL ?? "gpt-4o";

export async function generateStructuredJson<T>({
  system,
  prompt,
  fallback,
}: {
  system: string;
  prompt: string;
  fallback: T;
}): Promise<T> {
  const apiKey = process.env.AIML_API_KEY;

  if (!apiKey) {
    throw new Error("AIML_API_KEY is missing. Real AI execution is required.");
  }

  const response = await fetch(`${AIML_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AIML_MODEL,
      messages: [
        {
          role: "system",
          content: `${system}\nReturn valid JSON only.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`AI/ML API request failed: ${message}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI/ML API returned an empty completion.");
  }

  try {
    const json = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)?.[0] ?? content;
    return JSON.parse(json) as T;
  } catch {
    throw new Error("AI/ML API returned non-JSON output.");
  }
}
