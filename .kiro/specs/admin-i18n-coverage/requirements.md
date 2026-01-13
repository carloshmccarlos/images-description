# Requirements Document

## Introduction

This feature ensures comprehensive internationalization (i18n) coverage across the admin dashboard and all related components. The goal is to eliminate all hardcoded text strings and ensure every user-facing message, notification, label, and text element is properly internationalized using the existing i18n infrastructure (react-i18next).

## Glossary

- **Admin_Dashboard**: The administrative interface for managing users, content, and system health
- **i18n_System**: The internationalization system using react-i18next with translation files in `lib/i18n/translations/`
- **Translation_Key**: A unique identifier used to retrieve localized text from translation files
- **Toast_Notification**: A temporary message displayed to users for feedback on actions
- **Supported_Locales**: The languages supported by the application (en, zh, ja, ko)

## Requirements

### Requirement 1: Admin Components i18n Coverage

**User Story:** As an admin user, I want all admin dashboard components to display text in my selected language, so that I can manage the platform in my preferred language.

#### Acceptance Criteria

1. WHEN the MetricCard component renders, THE Admin_Dashboard SHALL display all labels using Translation_Keys from the admin namespace
2. WHEN the TimeSeriesChart component renders, THE Admin_Dashboard SHALL display the "Last 30 days" label using a Translation_Key
3. WHEN the UserDetailCard component renders, THE Admin_Dashboard SHALL display all static text (Profile Information, Learning Statistics, Suspend, Reactivate, etc.) using Translation_Keys
4. WHEN the AdminTable component renders, THE Admin_Dashboard SHALL display all column headers and action labels using Translation_Keys

### Requirement 2: User Form Language Options i18n

**User Story:** As an admin user, I want language selection dropdowns to display language names in my selected UI language, so that I can understand the options clearly.

#### Acceptance Criteria

1. WHEN the CreateUserModal displays language options, THE Admin_Dashboard SHALL show language names (English, Chinese, Japanese, Korean, Spanish, French, German) using Translation_Keys
2. WHEN the EditUserModal displays language options, THE Admin_Dashboard SHALL show language names using Translation_Keys
3. WHEN the EditUserDetailModal displays language options, THE Admin_Dashboard SHALL show language names using Translation_Keys
4. WHEN proficiency level options are displayed, THE Admin_Dashboard SHALL show level names (Beginner, Intermediate, Advanced) using Translation_Keys

### Requirement 3: Dynamic Text and Placeholders i18n

**User Story:** As an admin user, I want all dynamic text, placeholders, and fallback values to be displayed in my selected language, so that the entire interface is consistent.

#### Acceptance Criteria

1. WHEN a user has no name set, THE Admin_Dashboard SHALL display "Unnamed User" or equivalent using a Translation_Key
2. WHEN displaying date formats, THE Admin_Dashboard SHALL use locale-appropriate date formatting
3. WHEN displaying number formats, THE Admin_Dashboard SHALL use locale-appropriate number formatting
4. WHEN displaying role badges, THE Admin_Dashboard SHALL show translated role names (user, admin, super admin)
5. WHEN displaying status badges, THE Admin_Dashboard SHALL show translated status names (active, suspended)

### Requirement 4: Toast Notifications i18n

**User Story:** As an admin user, I want all success and error notifications to appear in my selected language, so that I understand the outcome of my actions.

#### Acceptance Criteria

1. WHEN a user action succeeds, THE Admin_Dashboard SHALL display success messages using Translation_Keys
2. WHEN a user action fails, THE Admin_Dashboard SHALL display error messages using Translation_Keys
3. WHEN network errors occur, THE Admin_Dashboard SHALL display appropriate error messages using Translation_Keys
4. WHEN validation errors occur, THE Admin_Dashboard SHALL display validation messages using Translation_Keys

### Requirement 5: Missing Translation Keys Addition

**User Story:** As a developer, I want all missing translation keys to be added to the admin translations file, so that the i18n system has complete coverage.

#### Acceptance Criteria

1. THE i18n_System SHALL include translation keys for all language names (English, Chinese, Japanese, Korean, Spanish, French, German)
2. THE i18n_System SHALL include translation keys for proficiency levels (beginner, intermediate, advanced)
3. THE i18n_System SHALL include translation keys for chart labels (Last 30 days)
4. THE i18n_System SHALL include translation keys for user detail card labels (Profile Information, Learning Statistics, Words Learned, Analyses, Current Streak, Longest Streak, Last Activity)
5. THE i18n_System SHALL include translation keys for action buttons (Suspend, Reactivate)
6. THE i18n_System SHALL include translation keys for fallback text (Unnamed User, Not set, Never)
7. THE i18n_System SHALL include all translation keys in all Supported_Locales (en, zh, ja, ko)

### Requirement 6: Consistent Translation Key Structure

**User Story:** As a developer, I want translation keys to follow a consistent naming convention, so that the codebase is maintainable.

#### Acceptance Criteria

1. THE i18n_System SHALL organize translation keys by feature area (sidebar, overview, users, userDetail, userForm, deleteDialog, content, logs, health, toast)
2. THE i18n_System SHALL use camelCase for translation key names
3. THE i18n_System SHALL avoid duplicate translation keys across different sections
4. WHEN a translation key is used in multiple places, THE i18n_System SHALL define it in the most appropriate section

### Requirement 7: Admin Table Component i18n

**User Story:** As an admin user, I want the admin table component to display all text in my selected language, so that I can understand table data clearly.

#### Acceptance Criteria

1. WHEN the AdminTable component renders column headers, THE Admin_Dashboard SHALL use Translation_Keys
2. WHEN the AdminTable component renders empty state messages, THE Admin_Dashboard SHALL use Translation_Keys
3. WHEN the AdminTable component renders pagination controls, THE Admin_Dashboard SHALL use Translation_Keys
4. WHEN the AdminTable component renders action buttons, THE Admin_Dashboard SHALL use Translation_Keys
