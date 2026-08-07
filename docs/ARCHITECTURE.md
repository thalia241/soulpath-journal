# Architecture

SoulPath uses a mobile-first client architecture backed by Supabase.

## Client
- React Native with Expo
- Expo Router for file-based navigation
- TypeScript for static type safety
- React Hook Form and Zod for validated input
- Service modules isolate database and authentication calls from UI components

## Backend
- Supabase Auth manages user identity and sessions
- PostgreSQL stores normalized journal and experience data
- Row Level Security enforces record ownership in the database

## Security principles
- No service-role key in the mobile client
- Public anonymous key stored only in environment configuration
- User ownership enforced in database policies, not only in UI logic
- Session tokens stored with Expo SecureStore
- No private journal content in logs or analytics

## Data model
Core entities include profiles, journal entries, spiritual practices, entry-practice joins, experiences, tags, entry-tag joins, and user settings.
