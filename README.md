# QuillNext

AI-powered curriculum generation platform built with Next.js 16 App Router, Prisma, and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js ≥ 24 (Active LTS recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other secrets
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components (Server Components by default)
- `src/server/` - Server-side code (actions, database client)
- `src/lib/` - Utility functions, schemas, and shared code
- `src/types/` - TypeScript type definitions
- `prisma/` - Prisma schema and migrations
- `quill-standards/` - Academic standards data

## Tech Stack

### Core
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5.9 (strict mode)
- **Runtime:** Node.js ≥ 24

### Database & ORM
- **Database:** PostgreSQL
- **ORM:** Prisma v7
- **Connection:** Prisma
- **Authentication:** Auth.js / NextAuth v5

### Data Layer
- **Server Actions:** Primary data mutation pattern (see `src/server/actions/README.md`)
- **Validation:** Zod

### UI & Styling
- **Styling:** Tailwind CSS v4.1
- **Components:** Radix UI (via shadcn)
- **Icons:** Phosphor Icons
- **Animations:** Framer Motion

### State Management
- **URL State:** Nuqs (source of truth)
- **Page State:** React Server Components (default)

### Forms & Validation
- **Forms:** React Hook Form
- **Schema Validation:** Zod

### Content & Features
- **AI:** Vercel AI SDK
  - Models: Gemini 2.0 Flash, Gemini 1.5 Pro
- **Rich Text:** Tiptap
- **Maps:** Leaflet + React Leaflet
- **Drag & Drop:** dnd-kit

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio

## Design System

See `.cursor/CURSOR_RULES.mdc` for complete design system guidelines.

Key design tokens:
- Primary: `#3A3F76` (Indigo)
- Secondary: `#D9A441` (Gold)
- Background: `#F9F5EF` (Parchment)
- Text: `#1C1E23` (Charcoal)

## Status
- [x] Direct Deployment Verified

