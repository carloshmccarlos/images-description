# Design Document: Admin i18n Coverage

## Overview

This design document outlines the approach for achieving comprehensive internationalization (i18n) coverage across the admin dashboard. The implementation leverages the existing react-i18next infrastructure and extends the admin translations file to include all missing translation keys.

## Architecture

The i18n system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (AdminSidebar, MetricCard, TimeSeriesChart, UserDetailCard) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  useTranslation Hook                         │
│              const { t } = useTranslation('admin')           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    i18next Instance                          │
│                   (lib/i18n/config.ts)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Translation Resources                       │
│           (lib/i18n/translations/admin.ts)                   │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   en    │  │   zh    │  │   ja    │  │   ko    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Translation Key Structure

The admin translations will be organized into the following sections:

```typescript
interface AdminTranslations {
  sidebar: SidebarTranslations;
  overview: OverviewTranslations;
  users: UsersTranslations;
  userDetail: UserDetailTranslations;
  userForm: UserFormTranslations;
  deleteDialog: DeleteDialogTranslations;
  content: ContentTranslations;
  logs: LogsTranslations;
  health: HealthTranslations;
  toast: ToastTranslations;
  languages: LanguageTranslations;      // NEW
  proficiency: ProficiencyTranslations; // NEW
  chart: ChartTranslations;             // NEW
  common: AdminCommonTranslations;      // NEW
}
```

### New Translation Sections

#### Languages Section
```typescript
interface LanguageTranslations {
  english: string;
  chinese: string;
  japanese: string;
  korean: string;
  spanish: string;
  french: string;
  german: string;
}
```

#### Proficiency Section
```typescript
interface ProficiencyTranslations {
  beginner: string;
  intermediate: string;
  advanced: string;
}
```

#### Chart Section
```typescript
interface ChartTranslations {
  last30Days: string;
  noData: string;
}
```

#### Admin Common Section
```typescript
interface AdminCommonTranslations {
  unnamedUser: string;
  profileInformation: string;
  learningStatistics: string;
  wordsLearned: string;
  analyses: string;
  currentStreak: string;
  longestStreak: string;
  lastActivity: string;
  suspend: string;
  reactivate: string;
}
```

## Data Models

### Translation Resource Structure

Each locale follows the same structure:

```typescript
const adminTranslations = {
  en: {
    // Existing sections...
    languages: {
      english: 'English',
      chinese: 'Chinese',
      japanese: 'Japanese',
      korean: 'Korean',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
    },
    proficiency: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    chart: {
      last30Days: 'Last 30 days',
      noData: 'No data available',
    },
    common: {
      unnamedUser: 'Unnamed User',
      profileInformation: 'Profile Information',
      learningStatistics: 'Learning Statistics',
      wordsLearned: 'Words Learned',
      analyses: 'Analyses',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      lastActivity: 'Last Activity',
      suspend: 'Suspend',
      reactivate: 'Reactivate',
    },
  },
  zh: { /* Chinese translations */ },
  ja: { /* Japanese translations */ },
  ko: { /* Korean translations */ },
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Translation Key Completeness

*For any* translation key defined in the English (en) locale, the same key path SHALL exist in all other supported locales (zh, ja, ko) with a non-empty string value.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 2: Translation Key Naming Convention

*For any* translation key name in the admin translations, the key SHALL follow camelCase naming convention (e.g., `userDetail`, `totalAnalyses`, not `user_detail` or `TotalAnalyses`).

**Validates: Requirements 6.2**

### Property 3: No Duplicate Translation Keys

*For any* translation key path within a single locale, the key SHALL be unique and not duplicated across different sections of the translation object.

**Validates: Requirements 6.3**

### Property 4: Locale-Aware Date Formatting

*For any* date value displayed in the admin dashboard, formatting the date with a specific locale SHALL produce output appropriate for that locale's conventions.

**Validates: Requirements 3.2**

### Property 5: Locale-Aware Number Formatting

*For any* numeric value displayed in the admin dashboard, formatting the number with a specific locale SHALL produce output appropriate for that locale's conventions (e.g., thousand separators).

**Validates: Requirements 3.3**

## Error Handling

### Missing Translation Keys

When a translation key is missing:
1. The i18next library will return the key itself as fallback
2. Development mode should log warnings for missing keys
3. The fallback language (English) will be used if available

### Invalid Locale

When an unsupported locale is requested:
1. The system falls back to the default locale (English)
2. No error is thrown to the user

## Testing Strategy

### Unit Tests

Unit tests will verify:
- All translation keys exist in all supported locales
- Translation values are non-empty strings
- Components render correctly with different locales

### Property-Based Tests

Property-based tests will verify:
- Translation key completeness across all locales
- Consistent translation structure between locales

### Integration Tests

Integration tests will verify:
- Components display correct translations when locale changes
- Toast notifications display in the correct language
- Language selector updates all admin components

### Test Configuration

- Use Jest with react-testing-library
- Mock i18next for component tests
- Test all 4 supported locales (en, zh, ja, ko)
- Minimum 100 iterations for property-based tests
