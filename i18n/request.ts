import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  const headersList = await headers();
  const localeHeader = headersList.get('x-locale')?.toLowerCase();
  
  let locale: Locale = defaultLocale;
  if (localeHeader && locales.includes(localeHeader as Locale)) {
    locale = localeHeader as Locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
