import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { DemoSection } from '@/components/landing/demo-section';
import { StatsSection } from '@/components/landing/stats-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
import { Navbar } from '@/components/landing/navbar';

export const metadata: Metadata = {
  title: 'LexiLens - Learn Vocabulary Through Images | AI-Powered Language Learning',
  description: 'Transform how you learn languages. Upload any photo and let AI teach you vocabulary in your target language. Free daily analyses, 20+ languages supported. Start learning naturally today!',
  openGraph: {
    title: 'LexiLens - Learn Vocabulary Through Images',
    description: 'Transform how you learn languages. Upload any photo and let AI teach you vocabulary in your target language.',
    type: 'website',
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect logged-in users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar user={null} />
      <HeroSection isLoggedIn={false} />
      <StatsSection />
      <FeaturesSection />
      <DemoSection />
      <CTASection isLoggedIn={false} />
      <Footer />
    </div>
  );
}
