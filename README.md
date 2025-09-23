# TractUs Assignment

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Express** - Fast, unopinionated web framework
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Project setup

This is a Turborepo monorepo with two apps:

- `apps/server` - Express API server (TypeScript) with Prisma + PostgreSQL
- `apps/web` - Next.js frontend (React)

Key libraries and tools:

- Prisma ORM, PostgreSQL database
- Better-Auth for authentication (email + password)
- Socket.IO for realtime events (contract finalized, AI analysis updates)
- AWS S3 for file storage (PDF uploads)
- Mistral OCR for PDF text extraction
- Groq for LLM analysis
- Tailwind CSS + shadcn/ui for UI

Default local ports (can be changed via env):

- Server API: http://localhost:4000
- Web app: http://localhost:3000

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Environment variables

### Server

Create `apps/server/.env` with the following variables:

- DATABASE_URL - PostgreSQL connection string (required)
- DIRECT_URL - PostgreSQL direct connection string used by Prisma Migrate (recommended)
- PORT - API server port (default: 4000)
- CORS_ORIGIN - Allowed origin for CORS and auth cookies, e.g. `http://localhost:3000`
- NEXT_PUBLIC_SERVER_URL - Base URL used by the web app to call the API and socket, e.g. `http://localhost:4000`
- S3_REGION - AWS region for S3, e.g. `us-east-1`
- S3_ACCESS_KEY_ID - AWS access key (required for uploads)
- S3_SECRET_ACCESS_KEY - AWS secret access key (required for uploads)
- S3_BUCKET_NAME - S3 bucket to store PDFs
- MISTRAL_API_KEY - API key for Mistral OCR
- GROQ_API_KEY - API key for GROQ

Example `apps/server/.env` (adjust values):

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tract_us?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/tract_us?schema=public"

# Server
PORT=4000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:4000

# AWS S3
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=YOUR_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_SECRET
S3_BUCKET_NAME=your-bucket-name

# OCR / AI
MISTRAL_API_KEY=sk_...
GROQ_API_KEY=sk_...
```

Notes:

- The web app reads `NEXT_PUBLIC_SERVER_URL` at build/runtime to target the API and socket.
- For development, set CORS_ORIGIN to your web origin (e.g., `http://localhost:3000`).
- Ensure your S3 bucket has permissions for PutObject from your credentials.

### Web

Create `apps/web/.env` with:

- NEXT_PUBLIC_SERVER_URL - The base URL of the API server, e.g. `http://localhost:4000`

```
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up and reachable from your machine.
2. Create `apps/server/.env` as described above with `DATABASE_URL` (and optional `DIRECT_URL`).
3. Generate the Prisma client and push the schema:
4. This project uses Supabase for the PostgreSQL database, so ensure your `DATABASE_URL` points to your Supabase instance.

```bash
pnpm db:push
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Local development

From the repo root:

1. Install deps

   ```powershell
   pnpm install
   ```

2. Configure env

   - Create `apps/server/.env` and `apps/web/.env` using the template above.
   - Ensure your PostgreSQL instance is running and accessible by `DATABASE_URL`.

3. Prepare database and Prisma client

   ```powershell
   pnpm db:push
   ```

   Optional (inspect data):

   ```powershell
   pnpm db:studio
   ```

4. Start dev servers (Turborepo runs both web and server concurrently)

   ```powershell
   pnpm dev
   ```

   - Web app: http://localhost:3000
   - API and Socket.IO: http://localhost:4000

If you want to run individual apps:

- Only server:

  ```powershell
  pnpm dev:server
  ```

- Only web:

  ```powershell
  pnpm dev:web
  ```

## Project Structure

```
tract-us-assignment/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Express)
```

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:server`: Start only the server
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm db:push`: Push schema changes to database
- `pnpm db:studio`: Open database studio UI

## Troubleshooting

- CORS/auth cookie issues: confirm `CORS_ORIGIN` matches the web origin and that `NEXT_PUBLIC_SERVER_URL` points to the API base URL.
- Socket connection issues: confirm the API is on `http://localhost:4000` (or update `NEXT_PUBLIC_SERVER_URL`).
- Prisma errors: verify `DATABASE_URL` is valid and database is reachable; re-run `pnpm db:generate` if needed.
- S3 upload failures: check S3 credentials, region, and bucket name; ensure file size is below 5 MB.


### Test Access Credentials
You can use the following test credentials to log in to the application:
- Email: prnvtripathi14@gmail.com
- Password: TestTest.123