# Requirements Document

## Introduction

This document defines the requirements for an image-based language learning platform that uses AI to analyze user-uploaded images, describe them in the target language, and extract daily object vocabulary for language learners.

## Glossary

- **Platform**: The image-based language learning web application
- **User**: A registered individual using the platform to learn languages
- **Analysis**: The AI-powered process of examining an uploaded image to generate descriptions and vocabulary
- **Vocabulary_Item**: A single word extracted from an image with its translation, pronunciation, and example sentence
- **Daily_Limit**: The maximum number of image analyses a free user can perform per day (5)
- **Learning_Language**: The language the user is trying to learn
- **Mother_Language**: The user's native language for translations
- **Saved_Analysis**: A persisted record containing an image, its AI description, and extracted vocabulary

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a new user, I want to create an account and log in, so that I can access the platform and save my learning progress.

#### Acceptance Criteria

1. WHEN a user submits a registration form with valid email and password, THE Platform SHALL create a new user account and send a verification email
2. WHEN a user attempts to register with an already-used email, THE Platform SHALL display an error message indicating the email is taken
3. WHEN a user clicks a Google or Apple OAuth button, THE Platform SHALL redirect to the provider and create/link the account upon successful authentication
4. WHEN a user submits valid login credentials, THE Platform SHALL authenticate the user and redirect to the dashboard
5. WHEN a user submits invalid login credentials, THE Platform SHALL display an error message without revealing which field is incorrect
6. WHEN a user requests a password reset, THE Platform SHALL send a reset link to the registered email
7. WHEN a user session expires, THE Platform SHALL redirect to the login page with a session expired message

### Requirement 2: Language Preference Configuration

**User Story:** As a user, I want to set my mother language and learning language, so that the platform can provide appropriate translations and descriptions.

#### Acceptance Criteria

1. WHEN a new user completes registration, THE Platform SHALL prompt them to select their mother language and learning language
2. WHEN a user selects languages from the settings page, THE Platform SHALL persist the preferences and apply them to all future analyses
3. WHEN a user changes their learning language, THE Platform SHALL update the language used for AI descriptions in subsequent analyses
4. THE Platform SHALL support at least 20 languages including English, Chinese, Spanish, French, Japanese, and Korean
5. WHEN a user selects a proficiency level (Beginner, Intermediate, Advanced), THE Platform SHALL adjust vocabulary complexity accordingly

### Requirement 3: Image Upload and Validation

**User Story:** As a user, I want to upload images for analysis, so that I can learn vocabulary from real-world visual context.

#### Acceptance Criteria

1. WHEN a user selects an image file, THE Platform SHALL validate that the format is JPG, PNG, or WEBP
2. WHEN a user uploads an image larger than 500KB, THE Platform SHALL automatically compress it client-side before upload
3. WHEN a user uploads an invalid file type, THE Platform SHALL display an error message listing supported formats
4. WHEN an image is successfully uploaded, THE Platform SHALL store it in Cloudflare R2 with a unique path based on user ID and timestamp
5. WHEN image compression fails, THE Platform SHALL display an error message and allow retry

### Requirement 4: AI Image Analysis

**User Story:** As a user, I want the AI to analyze my uploaded images, so that I can receive descriptions and vocabulary in my learning language.

#### Acceptance Criteria

1. WHEN an image is uploaded and validated, THE Platform SHALL send it to the SiliconFlow GLM 4.6V API for analysis
2. WHEN the AI completes analysis, THE Platform SHALL display a scene description in the user's learning language
3. WHEN the AI completes analysis, THE Platform SHALL extract and display a list of vocabulary items with translations to the mother language
4. FOR EACH Vocabulary_Item, THE Platform SHALL provide pronunciation guide and at least one example sentence
5. WHEN the AI analysis takes longer than 10 seconds, THE Platform SHALL display a timeout error and allow retry
6. IF the AI service returns an error, THEN THE Platform SHALL display a user-friendly error message and log the technical details

### Requirement 5: Daily Usage Limits

**User Story:** As a platform operator, I want to limit free users to 5 analyses per day, so that I can manage AI API costs.

#### Acceptance Criteria

1. THE Platform SHALL track the number of analyses performed by each user per day
2. WHEN a free user reaches 5 analyses in a day, THE Platform SHALL prevent further analyses and display an upgrade prompt
3. WHEN a user attempts to analyze an image, THE Platform SHALL display the remaining daily analyses count
4. THE Platform SHALL reset usage counts at 00:00 UTC daily
5. WHEN a user's daily limit resets, THE Platform SHALL restore their analysis capability without requiring any action

### Requirement 6: Save and Manage Analysis Results

**User Story:** As a user, I want to save and manage my analysis results, so that I can review vocabulary later.

#### Acceptance Criteria

1. WHEN an analysis completes, THE Platform SHALL offer the user an option to save the result
2. WHEN a user saves an analysis, THE Platform SHALL persist the image URL, description, and vocabulary to the database
3. WHEN a user views their saved analyses, THE Platform SHALL display them in reverse chronological order
4. WHEN a user deletes a saved analysis, THE Platform SHALL remove it from the database and confirm the deletion
5. WHEN a user searches saved analyses, THE Platform SHALL return results matching the query in descriptions or vocabulary words
6. WHEN a user requests export, THE Platform SHALL generate a downloadable PDF or CSV of their vocabulary

### Requirement 7: Learning Statistics and Progress

**User Story:** As a user, I want to track my learning progress, so that I can stay motivated and see my improvement.

#### Acceptance Criteria

1. THE Platform SHALL display the total count of unique words the user has learned
2. THE Platform SHALL track and display daily, weekly, and monthly activity counts
3. WHEN a user maintains consecutive daily activity, THE Platform SHALL increment and display their streak count
4. WHEN a user achieves milestones (10 words, 100 words, 7-day streak), THE Platform SHALL award and display achievement badges
5. WHEN a user misses a day, THE Platform SHALL reset their streak to zero

### Requirement 8: User Interface and Experience

**User Story:** As a user, I want a clean and responsive interface, so that I can use the platform comfortably on any device.

#### Acceptance Criteria

1. THE Platform SHALL implement a mobile-first responsive design that works on screens from 320px to 2560px width
2. THE Platform SHALL support both dark and light mode themes
3. WHEN navigating between pages, THE Platform SHALL display smooth transition animations
4. WHEN displaying vocabulary lists, THE Platform SHALL use staggered entrance animations
5. THE Platform SHALL meet WCAG 2.1 AA accessibility standards
6. WHEN an action completes successfully, THE Platform SHALL display a toast notification with slide-in animation

### Requirement 9: Security and Data Protection

**User Story:** As a user, I want my data to be secure, so that my personal information and learning history are protected.

#### Acceptance Criteria

1. THE Platform SHALL serve all content over HTTPS only
2. THE Platform SHALL implement rate limiting on all API endpoints
3. THE Platform SHALL validate and sanitize all user inputs before processing
4. THE Platform SHALL use Supabase Row Level Security to ensure users can only access their own data
5. WHEN uploading images, THE Platform SHALL validate file content matches the declared file type
6. THE Platform SHALL implement CORS configuration to prevent unauthorized cross-origin requests
