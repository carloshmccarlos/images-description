'use client';

import { NextIntlClientProvider as Provider } from 'next-intl';
import { type ReactNode } from 'react';

interface I18nProviderProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  timeZone?: string;
}

export function I18nProvider({ children, locale, messages, timeZone = 'UTC' }: I18nProviderProps) {
  return (
    <Provider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </Provider>
  );
}
