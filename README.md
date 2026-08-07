# SoulPath Journal

> A private space for the journey within.

SoulPath Journal is a privacy-focused mobile application for recording spiritual practices, moods, energy, dreams, synchronicities, and personal insights. It is designed as a focused portfolio application demonstrating secure full-stack product development without making medical, psychological, or predictive claims.

## Portfolio Highlights

- React Native and Expo mobile development
- TypeScript architecture
- Supabase authentication and PostgreSQL
- Row Level Security for private user data
- Relational database design
- CRUD operations and form validation
- Search, filters, and reusable query services
- Data visualization and weekly summaries
- PDF and text export
- Automated testing and continuous integration
- Accessible, responsive product design

## Planned MVP

- Secure registration, login, logout, and password recovery
- Daily journal entries
- Mood and energy tracking
- Spiritual practice selection
- Dream and synchronicity logs
- Search and filtering
- Weekly reflection summaries
- PDF and text export
- Account deletion and privacy controls

## Technology Stack

| Area | Technology |
|---|---|
| Mobile | React Native, Expo, Expo Router |
| Language | TypeScript |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Validation | React Hook Form, Zod |
| Secure storage | Expo SecureStore |
| Testing | Jest, React Native Testing Library |
| CI | GitHub Actions |

## Project Status

**Current milestone:** Foundation and authentication

See [ROADMAP.md](ROADMAP.md) for planned releases.

## Local Development

```bash
npm install
cp .env.example .env
npx expo start
```

Add your Supabase project values to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Privacy

SoulPath is designed around private-by-default data. Every user-owned database table uses Supabase Row Level Security so authenticated users can only access their own records.

SoulPath Journal is intended for personal reflection and wellness tracking. It does not provide medical, psychological, divinatory, or professional advice.

## Author

**Charity Deel**  
Computer Science student and full-stack developer  
GitHub: [thalia241](https://github.com/thalia241)

## License

This project is licensed under the MIT License.
