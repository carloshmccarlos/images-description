import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getAnalysisById } from '@/lib/actions/analysis/get-analysis-by-id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VocabularyCard } from '@/components/analysis/vocabulary-card';
import { formatDate } from '@/lib/utils';
import { DeleteAnalysisButton } from './delete-button';
import { SyncHeightLayout } from './sync-height-layout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedAnalysisPage({ params }: PageProps) {
  const { id } = await params;
  
  const result = await getAnalysisById({ id });

  if (!result.success) {
    if (result.error === 'Not authenticated') redirect('/auth/login');
    notFound();
  }

  const analysis = result.data!;

  const leftSection = (
    <div className="space-y-8">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[32px] border-4 border-white dark:border-zinc-900 shadow-2xl shadow-zinc-200 dark:shadow-black/40 group">
        <Image
          src={`/api/image?url=${encodeURIComponent(analysis.imageUrl)}`}
          alt="Analysis"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <Card className="border border-zinc-200 bg-white/75 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-xl font-semibold tracking-tight flex items-center justify-between">
            Field Description
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-bold text-zinc-500">
                {formatDate(analysis.createdAt)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-4">
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-xl italic font-medium">
            &ldquo;{analysis.description}&rdquo;
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const rightSection = (
    <>
      <div className="flex items-center justify-between px-4 mb-6">
        <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Vocabulary Log
        </h3>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
          <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
            {analysis.vocabulary.length} UNITS
          </span>
        </div>
      </div>
      
      <div className="grid gap-4 xl:grid-cols-2 pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {analysis.vocabulary.map((item, index) => (
          <VocabularyCard key={index} item={item} index={index} />
        ))}
      </div>
    </>
  );

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-12">
      <div className="flex items-center justify-between px-2">
        <Link href="/saved">
          <Button variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Button>
        </Link>
        <DeleteAnalysisButton id={analysis.id} />
      </div>

      <SyncHeightLayout
        leftContent={leftSection}
        rightContent={rightSection}
      />
    </div>
  );
}
