# QuillNext

Curriculum generation platform built with Next.js, tRPC, Prisma, and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js 20.9+ (Active LTS: Node.js 24 recommended)
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
- `src/components/` - React components
- `src/server/api/` - tRPC API routers
- `src/lib/` - Utility functions and shared code
- `src/types/` - TypeScript type definitions
- `prisma/` - Prisma schema and migrations
- `quill-standards/` - Academic standards data

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **API:** tRPC
- **AI Models:** Gemini 3 Pro, Gemini 2.5 Pro, Flash, Flash-Lite (intelligent task-based selection)
- **Authentication:** Auth.js (NextAuth.js v5)
- **Forms:** React Hook Form + Zod
- **Icons:** Phosphor Icons

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

