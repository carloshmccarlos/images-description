import { createAnalysisPrompt } from './prompts';
import type { VocabularyItem } from '@/lib/types/analysis';

export interface AnalysisResult {
  description: string;
  descriptionNative?: string;
  vocabulary: VocabularyItem[];
}

interface DoubaoMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
  }>;
}

interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function normalizeIfEnglish(input: string): string {
  const trimmed = input?.trim() ?? '';
  // If the text is primarily ASCII letters/punctuation, normalize to lowercase
  if (trimmed && /^[A-Za-z0-9\s.,'’\-?!:;()]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed || '';
}

export async function analyzeImage(
  imageUrl: string,
  learningLanguage: string,
  motherLanguage: string,
  proficiencyLevel: string
): Promise<AnalysisResult> {
  const optimizedPrompt = createAnalysisPrompt(learningLanguage, motherLanguage, proficiencyLevel);

  const messages: DoubaoMessage[] = [
    {
      role: 'system',
      content: [{ type: 'text', text: 'You are a precise language learning assistant that strictly follows formatting rules.' }],
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: optimizedPrompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ];

  const response = await fetch(`${process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DOUBAO_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DOUBAO_MODEL || 'doubao-seed-1-6-vision',
      messages,
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Doubao API error:', response.status, errorText);
    throw new Error(`Doubao API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as DoubaoResponse;
  const text = data.choices[0]?.message?.content;
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

  if (!parsed.description || !Array.isArray(parsed.vocabulary)) {
    throw new Error('Invalid AI response structure');
  }

  parsed.description = parsed.description || '';
  parsed.descriptionNative = parsed.descriptionNative || '';
  parsed.vocabulary = parsed.vocabulary.map((item) => ({
    word: normalizeIfEnglish(item.word || ''),
    translation: normalizeIfEnglish(item.translation || ''),
    pronunciation: item.pronunciation || '',
    exampleSentence: item.exampleSentence || '',
    category: item.category || 'unknown',
  }));

  return parsed;
}
