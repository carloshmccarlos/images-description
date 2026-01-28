import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { DemoSection } from '@/components/landing/demo-section';
import { StatsSection } from '@/components/landing/stats-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { PublicHeader } from '@/components/layout/public-header';

export const metadata: Metadata = {
  title: 'LexiLens - Learn Vocabulary Through Images | AI-Powered Language Learning',
  description: 'Transform how you learn languages. Upload any photo and let AI teach you vocabulary in your target language. Support for English, Chinese (Simplified/Traditional), Japanese, and Korean.',
  openGraph: {
    title: 'LexiLens - Learn Vocabulary Through Images',
    description: 'Transform how you learn languages. Upload any photo and let AI teach you vocabulary in your target language.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <PublicHeader />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DemoSection />
      <CTASection />
      <Footer />
    </div>
  );
}
