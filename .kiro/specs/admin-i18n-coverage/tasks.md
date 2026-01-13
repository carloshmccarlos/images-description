# Implementation Plan: Admin i18n Coverage

## Overview

This implementation plan adds comprehensive internationalization coverage to the admin dashboard by extending the admin translations file and updating all admin components to use translation keys instead of hardcoded strings.

## Tasks

- [ ] 1. Extend admin translations with new sections
  - [ ] 1.1 Add languages section with all language names (en, zh, ja, ko, es, fr, de)
    - Add translation keys for English, Chinese, Japanese, Korean, Spanish, French, German
    - Include translations in all 4 locales (en, zh, ja, ko)
    - _Requirements: 5.1, 5.7_

  - [ ] 1.2 Add proficiency section with level names
    - Add translation keys for beginner, intermediate, advanced
    - Include translations in all 4 locales
    - _Requirements: 5.2, 5.7_

  - [ ] 1.3 Add chart section with chart-related labels
    - Add translation keys for "Last 30 days", "No data available"
    - Include translations in all 4 locales
    - _Requirements: 5.3, 5.7_

  - [ ] 1.4 Add common section with shared admin labels
    - Add keys for: unnamedUser, profileInformation, learningStatistics, wordsLearned, analyses, currentStreak, longestStreak, lastActivity, suspend, reactivate
    - Include translations in all 4 locales
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [ ] 1.5 Write property test for translation key completeness
  - **Property 1: Translation Key Completeness**
  - Verify all keys in English locale exist in zh, ja, ko locales
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

- [ ] 2. Update TimeSeriesChart component for i18n
  - [ ] 2.1 Replace hardcoded "Last 30 days" with translation key
    - Import useTranslation hook
    - Use t('chart.last30Days') for the label
    - _Requirements: 1.2, 5.3_

- [ ] 3. Update UserDetailCard component for i18n
  - [ ] 3.1 Replace hardcoded labels with translation keys
    - Replace "Profile Information" with t('common.profileInformation')
    - Replace "Learning Statistics" with t('common.learningStatistics')
    - Replace "Words Learned", "Analyses", "Current Streak", etc.
    - Replace "Suspend" and "Reactivate" button labels
    - Replace "Unnamed User" fallback text
    - _Requirements: 1.3, 3.1, 5.4, 5.5, 5.6_

- [ ] 4. Update user form modals for i18n
  - [ ] 4.1 Update CreateUserModal language options
    - Replace hardcoded language names with translation keys
    - Use t('languages.english'), t('languages.chinese'), etc.
    - _Requirements: 2.1_

  - [ ] 4.2 Update CreateUserModal proficiency options
    - Replace hardcoded proficiency levels with translation keys
    - Use t('proficiency.beginner'), t('proficiency.intermediate'), t('proficiency.advanced')
    - _Requirements: 2.4_

  - [ ] 4.3 Update EditUserModal language and proficiency options
    - Apply same changes as CreateUserModal
    - _Requirements: 2.2, 2.4_

  - [ ] 4.4 Update EditUserDetailModal language and proficiency options
    - Apply same changes as CreateUserModal
    - _Requirements: 2.3, 2.4_

- [ ] 5. Update admin users page for i18n
  - [ ] 5.1 Replace hardcoded "Unnamed User" fallback
    - Use t('common.unnamedUser') for users without names
    - _Requirements: 3.1_

  - [ ] 5.2 Ensure role and status badges use translation keys
    - Verify role badges use t('users.roleUser'), t('users.roleAdmin'), t('users.roleSuperAdmin')
    - Verify status badges use t('users.statusActive'), t('users.statusSuspended')
    - _Requirements: 3.4, 3.5_

- [ ] 6. Update user detail page for i18n
  - [ ] 6.1 Replace hardcoded labels in user detail page
    - Ensure all static text uses translation keys
    - Update language name display to use translation keys
    - _Requirements: 1.3, 3.1_

  - [ ] 6.2 Update getLanguageName function to use translations
    - Replace hardcoded language name mapping with translation keys
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Checkpoint - Verify all translations work
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify language switching works in admin dashboard

- [ ] 8. Write property tests for translation structure
  - [ ] 8.1 Write property test for camelCase naming convention
    - **Property 2: Translation Key Naming Convention**
    - Verify all translation keys follow camelCase
    - **Validates: Requirements 6.2**

  - [ ] 8.2 Write property test for no duplicate keys
    - **Property 3: No Duplicate Translation Keys**
    - Verify no duplicate keys exist across sections
    - **Validates: Requirements 6.3**

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive i18n coverage
- Each task references specific requirements for traceability
- The implementation uses the existing react-i18next infrastructure
- All translations must be added to all 4 supported locales (en, zh, ja, ko)
- Property tests validate universal correctness properties
