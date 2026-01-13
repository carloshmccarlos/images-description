import { createAnalysisPrompt } from './prompts';
import type { VocabularyItem } from '@/lib/db/schema';

export interface AnalysisResult {
  description: string;
  descriptionNative?: string;
  vocabulary: VocabularyItem[];
}

function normalizeIfEnglish(input: string): string {
  const trimmed = input?.trim() ?? '';
  if (trimmed && /^[A-Za-z0-9\s.,'’\-?!:;()]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed || '';
}

type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } };

type SiliconFlowMessage = {
  role: 'user' | 'assistant' | 'system';
  content: ContentItem[];
};

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string | ContentItem[];
    };
  }>;
}

function extractTextContent(content: string | ContentItem[] | undefined): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textItem = content.find((item): item is Extract<ContentItem, { type: 'text' }> => item.type === 'text');
    return textItem?.text ?? '';
  }
  return '';
}

export async function analyzeImage(
  imageUrl: string,
  learningLanguage: string,
  motherLanguage: string,
  proficiencyLevel: string
): Promise<AnalysisResult> {
  const prompt = createAnalysisPrompt(learningLanguage, motherLanguage, proficiencyLevel);

  const levelGuidanceMap: Record<string, string> = {
    beginner: 'Use simple vocabulary and short sentences. Focus on common, everyday words.',
    intermediate: 'Use moderate vocabulary with some complex sentences. Include useful phrases.',
    advanced: 'Use rich vocabulary including idioms and nuanced expressions.',
  };
  const levelGuidance = levelGuidanceMap[proficiencyLevel] || levelGuidanceMap.beginner;
  const targetLang = learningLanguage;
  const nativeLang = motherLanguage;

  const messages: SiliconFlowMessage[] = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: imageUrl, detail: 'auto' },
        },
        {
          type: 'text',
          text: `
targetLang: ${targetLang}
nativeLang: ${nativeLang}
levelGuidance: ${levelGuidance}
          `.trim(),
        },
      ],
    },
  ];

  const response = await fetch(`${process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-VL-32B-Instruct',
      messages,
      max_tokens: 4096,
      temperature: 0.2,
      top_p: 0.85,
      top_k: 20,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SiliconFlow API error:', response.status, errorText);
    throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as SiliconFlowResponse;
  const content = data.choices?.[0]?.message?.content;
  const text = extractTextContent(content);

  if (!text) {
    throw new Error('No response from AI');
  }

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(text) as AnalysisResult;
  } catch {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse AI response');
  }

  // Validate the response structure
  if (!parsed.description || !Array.isArray(parsed.vocabulary)) {
    throw new Error('Invalid AI response structure');
  }

  parsed.description = parsed.description || '';
  parsed.descriptionNative = parsed.descriptionNative || '';

  // Ensure all vocabulary items have required fields
  parsed.vocabulary = parsed.vocabulary.map((item) => ({
    word: normalizeIfEnglish(item.word || ''),
    translation: normalizeIfEnglish(item.translation || ''),
    pronunciation: item.pronunciation || '',
    exampleSentence: item.exampleSentence || '',
    category: item.category || 'unknown',
  }));

  return parsed;
}
