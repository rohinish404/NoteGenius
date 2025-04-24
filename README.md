# AI Notes App

A simple note-taking application built with Next.js, Supabase for authentication, Prisma for database interaction, Groq for AI-powered summarization, and Shadcn/ui for the user interface.

## Key Features

*   **User Authentication:** Secure login/signup using email/password or Google OAuth via Supabase.
*   **Note Management:** Create, read, update, and delete notes (CRUD).
*   **AI Note Summarization:** Generate concise summaries of notes using the Groq API (powered by models like Llama 3.3).
*   **Rich Text Editor:** Basic textarea for note content.
*   **Responsive UI:** Built with Shadcn/ui and Tailwind CSS, designed to work across devices.
*   **Real-time Feedback:** Uses React Query for data fetching/caching and Sonner for toast notifications.

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Authentication:** Supabase Auth
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **AI Provider:** Groq API
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **State Management/Data Fetching:** TanStack Query (React Query)
*   **Notifications:** Sonner

## Prerequisites

*   Node.js (v18 or later recommended) or Bun
*   pnpm, npm, or yarn package manager
*   PostgreSQL database instance (local or cloud)
*   Supabase Account (for Auth)
*   Groq API Key

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ai-notes
    ```

2.  **Install dependencies:**
    ```bash
    # Using Bun (recommended based on package.json scripts)
    bun install

    # Or using npm
    npm install

    # Or using yarn
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables. Replace the placeholder values with your actual credentials.

    ```env
    # Database URL (Prisma) - e.g., postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL="postgresql://..."

    # Supabase Credentials (found in your Supabase project settings)
    SUPABASE_URL="https://your-project-ref.supabase.co"
    SUPABASE_ANON_KEY="your-anon-key"

    # Groq API Key (get from console.groq.com)
    GROQ_API_KEY="gsk_..."

    # Your site's base URL (for OAuth redirects)
    # Use http://localhost:3000 for local development
    SITE_URL="http://localhost:3000"
    ```
    *   **Important:** For Supabase OAuth (Google Sign-In) to work correctly, ensure you configure the `SITE_URL` in your Supabase project's authentication settings under "URL Configuration" > "Redirect URLs". Add `${SITE_URL}/api/auth/callback` (e.g., `http://localhost:3000/api/auth/callback`).

4.  **Set up the Database:**
    Run the Prisma migration command to sync your database schema and create the necessary tables.

    ```bash
    # Using Bun
    bunx prisma migrate dev

    # Or using npx
    npx prisma migrate dev
    ```
    *Note: The `package.json` includes a `migrate` script: `bun run migrate`*

5.  **Generate Prisma Client:**
    Although `migrate dev` usually does this, you can run it manually if needed:
    ```bash
    # Using Bun
    bunx prisma generate

    # Or using npx
    npx prisma generate
    ```

## Running the Application

Start the development server:

```bash
# Using Bun (with Turbopack as per package.json)
bun run dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```



## Implementation Brief

*   **Directory Structure:** The project follows a standard Next.js App Router structure.
    *   `app/`: Contains UI pages, API routes, and the main layout.
    *   `actions/`: Holds Next.js Server Actions for backend logic (user auth, AI calls).
    *   `auth/`: Supabase server-side client setup.
    *   `components/`: Reusable React components, including UI elements built with Shadcn/ui.
    *   `db/`: Prisma schema, migrations, and client instance.
    *   `lib/`: Utility functions, API client logic (Groq, Notes API), type definitions.
    *   `hooks/`: Custom React hooks.
    *   `middleware.ts`: Handles authentication checks and redirects for protected routes.
*   **Authentication Flow:**
    *   Users interact with `AuthForm` (`/login`, `/signup`).
    *   Email/Password auth uses Server Actions (`actions/users.ts`) calling Supabase `signInWithPassword` or `signUp`.
    *   Google OAuth uses `signInWithOAuth`, redirecting to Supabase and then back to `/api/auth/callback`.
    *   The callback route (`/api/auth/callback/route.ts`) exchanges the code for a session, creates a user record in the local DB if needed, and redirects to the dashboard.
    *   `middleware.ts` uses Supabase SSR client to check authentication status on relevant routes and redirects accordingly.
*   **Notes CRUD & Data Fetching:**
    *   The Dashboard (`app/dashboard/page.tsx`) uses React Query (`useQuery`, `useMutation`) to manage note data.
    *   React Query hooks call functions in `lib/notes.ts`.
    *   These functions (`fetchNotes`, `createNote`, etc.) make requests to the Next.js API routes under `/api/notes/`.
    *   The API routes (`app/api/notes/.../route.ts`) use the Supabase server client (`auth/server.ts`) to get the authenticated user and interact with the database via Prisma (`db/prisma.ts`).
*   **AI Summarization:**
    *   The user triggers summarization from the `NoteEditor` component.
    *   This calls the `summarizeNoteAction` Server Action (`actions/notes.ts`).
    *   The action retrieves the note content (checking ownership), calls the Groq API (`lib/groq.ts`) with appropriate prompts, and returns the summary or an error.
    *   The result is displayed in the `SummaryDialog`.
