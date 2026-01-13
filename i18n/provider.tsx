'use client';

import { NextIntlClientProvider as Provider } from 'next-intl';
import { type ReactNode } from 'react';

interface I18nProviderProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  return (
    <Provider locale={locale} messages={messages}>
      {children}
    </Provider>
  );
}
