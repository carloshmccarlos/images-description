import type { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your LexiLens dashboard - track your vocabulary learning progress, view recent analyses, and start new image analyses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
