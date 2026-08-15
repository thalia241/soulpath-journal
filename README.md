# SoulPath Journal

> **A private space for the journey within.**

SoulPath Journal is a cross-platform journaling and self-reflection application built with React Native, Expo, TypeScript, and Supabase.

The app gives users a private place to record daily reflections, track mood and energy, document dreams and meaningful experiences, record spiritual practices, notice patterns over time, and export their data in portable formats.

SoulPath was built as a portfolio-quality mobile application with an emphasis on privacy, reliable data handling, thoughtful UX, accessibility, and cross-platform behavior.

---

## ✦ Core Features

### Daily Reflection

Create and revisit personal journal entries with:

* Title and reflection content
* Mood tracking
* Energy tracking
* Local-calendar-safe journal dates
* Associated spiritual practices
* Search and filtering
* Multiple reflections per day

### Dreams & Signs

Record experiences such as:

* Dreams
* Synchronicities
* Personal interpretations
* Significance ratings
* Exact date and time

SoulPath presents these experiences as personal observations rather than predictions or claims about their meaning.

### Spiritual Practices

Journal entries can be connected with practices including:

* Meditation
* Prayer
* Tarot
* Astrology Study
* Breathwork
* Yoga
* Shadow Work
* Traditional Chinese Medicine routines
* Ayurvedic routines
* Dream Interpretation

### Insights

SoulPath creates observational summaries from the user's own records.

Insights can surface patterns involving:

* Journaling frequency
* Mood
* Energy
* Practices
* Dreams and synchronicities

The application intentionally avoids medical, causal, predictive, or divinatory claims.

### Search & Filters

Journal records can be filtered by:

* Search text
* Mood
* Recent time periods

Filtering is designed around a personal journal dataset while maintaining a simple and responsive interface.

### Data Export

Users can take their SoulPath data with them at any time.

Supported export formats:

* **PDF** — polished human-readable journal export
* **TXT** — lightweight portable text backup
* **JSON** — structured data export with a versioned schema

Native Android/iOS exports use the system share sheet, while web exports use browser-compatible download and printing behavior.

Authentication credentials, passwords, access tokens, refresh tokens, and application secrets are never included in exports.

---

## ☾ Privacy & Security

SoulPath is designed around private user-owned data.

Security features include:

* Supabase authentication
* User-scoped PostgreSQL records
* Row Level Security policies
* Authenticated CRUD operations
* Explicit user filtering in service operations
* Session-expiration handling
* Session recovery
* Secure client configuration
* No service-role credentials in the mobile client
* Data deletion controls
* Portable user exports

Users can delete their recorded journal and experience data while retaining their account and profile.

---

## Architecture

```text
SoulPath Journal
│
├── React Native / Expo UI
│
├── Expo Router
│   ├── Authentication routes
│   ├── Tab navigation
│   ├── Journal routes
│   ├── Dreams & Signs routes
│   └── Settings routes
│
├── Shared UI System
│   ├── SoulScreen
│   ├── SoulButton
│   ├── SoulInput
│   ├── SoulCard
│   ├── EmptyState
│   └── FeedbackMessage
│
├── Application Services
│   ├── Journal Service
│   ├── Practice Service
│   ├── Experience Service
│   ├── Insight Service
│   └── Export Service
│
└── Supabase
    ├── Authentication
    ├── PostgreSQL
    ├── Row Level Security
    └── Atomic journal/practice updates
```

---

## Tech Stack

| Area                 | Technology                  |
| -------------------- | --------------------------- |
| Mobile/Web           | React Native                |
| Framework            | Expo SDK 57                 |
| Language             | TypeScript                  |
| Routing              | Expo Router                 |
| Authentication       | Supabase Auth               |
| Database             | PostgreSQL / Supabase       |
| Authorization        | Row Level Security          |
| Storage / local APIs | Expo APIs                   |
| PDF Export           | Expo Print                  |
| File Export          | Expo FileSystem             |
| Native Sharing       | Expo Sharing                |
| Fonts                | Cormorant Garamond + Nunito |
| Android Builds       | EAS Build                   |

---

## Reliability Engineering

SoulPath includes several application-hardening features beyond basic CRUD functionality.

### Fault-Tolerant Dashboard

The Today dashboard loads independent data sources using partial-failure handling.

A single failed request does not prevent the rest of the dashboard from displaying.

### Session Recovery

Authentication state is managed centrally.

SoulPath distinguishes between:

* Expired authentication
* Recoverable sessions
* Network failures

Temporary connectivity problems do not automatically sign the user out.

### Atomic Practice Updates

Journal-to-practice relationships are updated using a PostgreSQL RPC operation so replacing associated practices occurs as one database transaction.

This prevents partially updated journal/practice relationships.

### Safe Date Handling

Journal entries represent calendar dates rather than timestamps.

SoulPath avoids parsing date-only values as UTC timestamps, preventing common previous-day/next-day errors caused by timezone conversion.

### Validation

Shared validation handles:

* Required fields
* Email addresses
* Password creation
* Display names
* Journal titles
* Journal content
* Dream/sign content
* Energy ratings
* Significance ratings

### Unsaved Changes Protection

Editing forms detect unsaved changes and warn users before accidental navigation removes their work.

---

## Accessibility & Responsive Design

SoulPath includes:

* Safe-area-aware layouts
* Responsive horizontal spacing
* Mobile, tablet, and web layouts
* Minimum touch targets
* Accessible button labels
* Accessible form labels
* Selected/disabled accessibility states
* Screen-reader-aware controls
* Keyboard-aware forms
* Dynamic text-friendly sizing

The interface has been tested as an actual Android development build rather than only through a browser or simulator.

---

## Visual Design

SoulPath uses a custom dark visual system built around:

* Deep indigo backgrounds
* Lavender accents
* Restrained gold highlights
* Rounded elevated surfaces
* Celestial motifs
* Cormorant Garamond display typography
* Nunito interface typography

The visual direction is intended to feel reflective and soulful without sacrificing readability or usability.

---

## Screenshots

### Today

![SoulPath Today](docs/screenshots/01-today.png)

### Journal

![SoulPath Journal](docs/screenshots/02-journal.png)

### Reflection

![SoulPath Reflection](docs/screenshots/03-reflection.png)

### Dreams & Signs

![SoulPath Dreams and Signs](docs/screenshots/04-dreams-signs.png)

### Insights

![SoulPath Insights](docs/screenshots/05-insights.png)

### Data & Export

![SoulPath Data Export](docs/screenshots/06-data-export.png)

---

## Project Structure

```text
app/
├── _layout.tsx
├── index.tsx
├── login.tsx
├── register.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── today.tsx
│   ├── journal.tsx
│   ├── experiences.tsx
│   ├── insights.tsx
│   └── settings.tsx
│
├── journal/
│   ├── new.tsx
│   ├── [id].tsx
│   └── edit/
│
├── experiences/
│   ├── new.tsx
│   ├── [id].tsx
│   └── edit/
│
└── settings/

src/
├── components/
├── context/
├── hooks/
├── lib/
├── screens/
├── services/
├── theme/
└── utils/
```

---

## Running Locally

### Requirements

* Node.js
* npm
* Expo
* A Supabase project

Clone the repository:

```bash
git clone https://github.com/thalia241/soulpath-journal.git
cd soulpath-journal
```

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Do not commit `.env`.

Verify dependency compatibility:

```bash
npx expo-doctor
```

Verify TypeScript:

```bash
npx tsc --noEmit
```

Start development:

```bash
npx expo start
```

For an installed Expo development client:

```bash
npx expo start --dev-client
```

---

## Android Builds

SoulPath uses EAS Build.

Development APK:

```bash
npx eas-cli@latest build --platform android --profile development
```

Internal preview APK:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Production Android build:

```bash
npx eas-cli@latest build --platform android --profile production
```

---

## Current Status

SoulPath currently includes:

* Authentication
* Profile management
* Journal CRUD
* Dream and synchronicity CRUD
* Mood and energy tracking
* Practice relationships
* Search and filtering
* Insights
* Data deletion
* PDF export
* TXT export
* JSON export
* Responsive layouts
* Accessibility improvements
* Session recovery
* Android development builds
* Custom SoulPath visual identity
* Animated application launch transition

---

## Future Improvements

Potential future development includes:

* Encrypted offline journaling
* Offline-first synchronization
* Optional biometric app lock
* User-controlled reminders
* Additional insight visualizations
* Import from SoulPath JSON backups
* Improved tablet layouts
* Native iOS release
* Additional accessibility testing

---

## Engineering Focus

SoulPath was built to demonstrate more than screen design.

The project includes practical examples of:

* Full-stack application architecture
* Mobile UI development
* TypeScript
* Authentication
* Relational database design
* PostgreSQL
* Row Level Security
* Transactional data operations
* CRUD architecture
* Error recovery
* State management
* Responsive design
* Accessibility
* Cross-platform file generation
* Data portability
* Native Android development and testing

---

## Author

**Charity Deel**

Computer Science — Software Engineering

GitHub: **thalia241**

---

*SoulPath Journal — A private space for the journey within.*

