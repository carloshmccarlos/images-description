import { createAnalysisPrompt } from './prompts';
import type { VocabularyItem } from '@/lib/db/schema';

export interface AnalysisResult {
  description: string;
  vocabulary: VocabularyItem[];
}

interface SiliconFlowMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
  }>;
}

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function analyzeImage(
  imageUrl: string,
  learningLanguage: string,
  motherLanguage: string,
  proficiencyLevel: string
): Promise<AnalysisResult> {
  const prompt = createAnalysisPrompt(learningLanguage, motherLanguage, proficiencyLevel);

  const messages: SiliconFlowMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl, detail: 'auto' } },
        { type: 'text', text: prompt },
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
      model: 'zai-org/GLM-4.6V',
      messages,
      max_tokens: 8192,
      temperature: 0.6,
      top_p: 0.95,
      top_k: 20,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SiliconFlow API error:', response.status, errorText);
    throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as SiliconFlowResponse;
  const text = data.choices[0]?.message?.content;

  if (!text) {
    throw new Error('No response from AI');
  }

  // Parse the JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;

  // Validate the response structure
  if (!parsed.description || !Array.isArray(parsed.vocabulary)) {
    throw new Error('Invalid AI response structure');
  }

  // Ensure all vocabulary items have required fields
  parsed.vocabulary = parsed.vocabulary.map((item) => ({
    word: item.word || '',
    translation: item.translation || '',
    pronunciation: item.pronunciation || '',
    exampleSentence: item.exampleSentence || '',
    category: item.category || 'unknown',
  }));

  return parsed;
}
