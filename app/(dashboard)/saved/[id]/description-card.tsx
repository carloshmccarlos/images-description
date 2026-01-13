'use client';

import { useMemo, useState } from 'react';
// Audio icons intentionally unused while description audio is paused
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DescriptionCardTranslations {
  description: string;
  translated: string;
  native: string;
  listen: string;
}

interface DescriptionCardProps {
  analysisId: string;
  description: string;
  descriptionNative: string | null;
  createdAtLabel: string;
  translations: DescriptionCardTranslations;
  descriptionAudioUrl?: string | null;
  descriptionNativeAudioUrl?: string | null;
}

export function DescriptionCard({
  analysisId,
  description,
  descriptionNative,
  createdAtLabel,
  translations,
  descriptionAudioUrl,
  descriptionNativeAudioUrl,
}: DescriptionCardProps) {
  const [activeTab, setActiveTab] = useState<'translated' | 'native'>('translated');

  const canShowNative = Boolean(descriptionNative);

  const tabs = useMemo(() => {
    const items: Array<{ value: 'translated' | 'native'; label: string }> = [
      { value: 'translated', label: translations.translated },
    ];

    if (canShowNative) items.push({ value: 'native', label: translations.native });

    return items;
  }, [canShowNative, translations.native, translations.translated]);

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
      <CardHeader className="pb-2 relative z-10 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold tracking-tight">{translations.description}</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-500">{createdAtLabel}</span>
          </div>
        </div>

        {tabs.length > 1 ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'translated' | 'native')} className="w-full">
            <div className="flex items-center justify-between gap-3">
              <TabsList className="w-fit">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="translated" className="mt-4">
              <CardContent className="relative z-10 pt-0">
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl italic font-medium">
                  &ldquo;{description}&rdquo;
                </p>
              </CardContent>
            </TabsContent>

            <TabsContent value="native" className="mt-4">
              <CardContent className="relative z-10 pt-0">
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl italic font-medium">
                  &ldquo;{descriptionNative}&rdquo;
                </p>
              </CardContent>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <CardContent className="relative z-10 pt-0">
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl italic font-medium">
                &ldquo;{description}&rdquo;
              </p>
            </CardContent>
          </>
        )}
      </CardHeader>
    </Card>
  );
}
