# Product Requirements Document (PRD)
## Image-Based Language Learning Platform

---

## 1. Overview

### 1.1 Product Vision
A web-based language learning platform that uses AI to analyze user-uploaded images, describe them in the target language, and extract daily object vocabulary for language learners.

### 1.2 Target Users
- Language learners (beginner to intermediate)
- Students studying foreign languages
- Travelers preparing for trips abroad
- Anyone wanting to learn vocabulary through visual context

### 1.3 Core Value Proposition
Learn vocabulary naturally by connecting words to real-world images from your daily life.

---

## 2. Features

### 2.1 User Authentication
| Feature | Description |
|---------|-------------|
| Registration | Email/password signup with email verification |
| Login | Email/password authentication |
| Social Login | Google, Apple OAuth |
| Password Reset | Email-based password recovery |
| Session Management | Supabase Auth (JWT-based) |

### 2.2 Language Settings
| Setting | Options |
|---------|---------|
| Mother Language | 20+ languages (English, Chinese, Spanish, French, Japanese, Korean, etc.) |
| Learning Language | Same language options as mother language |
| Proficiency Level | Beginner, Intermediate, Advanced |

### 2.3 Image Analysis (Core Feature)
| Feature | Description |
|---------|-------------|
| Image Upload | Support JPG, PNG, WEBP (max 500KB, auto-compress larger files) |
| AI Description | Generate detailed scene description in learning language |
| Vocabulary Extraction | List daily objects with translations |
| Word Details | Pronunciation, example sentences, word category |

### 2.4 Usage Limits
| User Type | Daily Limit |
|-----------|-------------|
| Free User | 5 image analyses per day |
| Premium User | Unlimited (future feature) |

Reset time: 00:00 UTC daily

### 2.5 Save & Manage Results
| Feature | Description |
|---------|-------------|
| Save Analysis | Save image + description + vocabulary |
| View Saved | Browse all saved analyses |
| Delete Saved | Remove individual saved items |
| Search Saved | Search by word or description |
| Export | Download vocabulary as PDF/CSV |

### 2.6 Additional Features

#### 2.6.1 Learning Statistics
- Words learned count
- Daily/weekly/monthly activity
- Streak tracking
- Achievement badges

#### 2.6.2 Pronunciation Practice
- Record your pronunciation
- AI comparison with native pronunciation
- Pronunciation score

### 2.7 Admin Dashboard (Platform Management)
| Feature | Description |
|---------|-------------|
| Platform Analytics | Total users, analyses, DAU, words learned, growth charts |
| User Management | View, search, suspend/reactivate user accounts |
| Content Moderation | Review, flag, delete inappropriate content |
| Activity Logging | Audit trail of admin actions |
| System Health | API response times, storage usage, error rates |
| Role-Based Access | admin and super_admin roles |

---

## 3. User Flows

### 3.1 New User Flow
1. Land on homepage → See demo/preview
2. Click "Get Started" → Registration form
3. Complete registration → Email verification
4. First login → Language preference setup
5. Upload first image → See analysis result
6. Prompt to save result

### 3.2 Returning User Flow
1. Login → Dashboard
2. See remaining daily analyses
3. Upload image or review saved items
4. Track learning progress

### 3.3 Image Analysis Flow
1. Click "Analyze Image"
2. Check daily limit (if exceeded → show upgrade prompt)
3. Upload image (auto-compress if > 500KB)
4. Show loading state
5. Display: AI description + vocabulary list
6. Option to save or discard

---

## 4. UI/UX Requirements

### 4.1 Pages
| Page | Description |
|------|-------------|
| Landing | Hero, features, demo, CTA |
| Login/Register | Auth forms |
| Dashboard | Usage stats, quick actions |
| Analyze | Image upload + results |
| Saved | List of saved analyses |
| Settings | Language preferences, account |
| Profile | Stats, achievements |

### 4.2 Admin Pages
| Page | Description |
|------|-------------|
| Admin Overview | Platform metrics, growth charts |
| User Management | User list, search, detail view |
| Content Moderation | Analysis review, flag/delete |
| Activity Logs | Admin action audit trail |
| System Health | Performance metrics, warnings |

### 4.2 Design Principles
- Mobile-first responsive design
- Clean, minimal interface
- Clear visual hierarchy
- Accessible (WCAG 2.1 AA)
- Dark/Light mode support
- Smooth animations and micro-interactions (Framer Motion)

---

## 5. Security Requirements

- HTTPS only
- Password hashing (via Supabase Auth)
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Image file validation (type, size, content)
- SQL injection prevention (Supabase RLS)
- XSS protection

---

## 6. Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Image Analysis | < 10 seconds |
| API Response | < 500ms |
| Uptime | 99.5% |

- Cache user session on the client to avoid refetching on every navigation.
- Use TanStack Query as the single source of truth for client data and minimize per-navigation requests via cached, aggregated API responses.

---

## 7. Future Enhancements (v2.0+)

- Premium subscription tier
- Mobile app (iOS/Android)
- Offline mode
- Community features (share, compete)
- AI conversation practice
- Grammar explanations
- Integration with language learning apps
- Browser extension for web images
- Vocabulary review system with spaced repetition
- Custom word collections

---

## 8. Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Registered Users | 1,000 |
| Daily Active Users | 200 |
| Images Analyzed | 10,000 |
| User Retention (7-day) | 30% |
| Average Session Duration | 5 minutes |

---

## 9. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | 2 weeks | Auth, basic UI, image upload |
| Phase 2 | 2 weeks | AI integration, vocabulary extraction |
| Phase 3 | 1 week | Save/delete, usage limits |
| Phase 4 | 1 week | Stats, achievements |
| Phase 5 | 1 week | Testing, polish, deploy |

**Total: ~7 weeks**

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI API costs | Usage limits, image compression |
| Image abuse | Content moderation, file validation |
| Scalability | Supabase + Cloudflare infrastructure |
| Data privacy | GDPR compliance, Supabase RLS |

---

*Document Version: 1.1*  
*Created: December 28, 2025*  
*See: [tech-stack.md](./tech-stack.md) for technical implementation details*
