# Development Setup

# GidaLink Trust

## 1. Requirements

Install:

- Node.js (LTS recommended)
- npm
- Git
- Visual Studio Code
- Supabase account
- Modern web browser

Optional:

- Kane CLI for browser testing.
- GitHub account for source control.

## 2. Clone the Project

If working from GitHub:

git clone YOUR_REPOSITORY_URL

cd gidalink-trust

If the project already exists locally:

cd "$HOME/Downloads/gidalink-trust"

## 3. Install Dependencies

npm install

## 4. Required Packages

The project uses:

- react
- react-dom
- typescript
- vite
- react-router-dom
- lucide-react
- framer-motion
- @supabase/supabase-js
- zod
- react-hook-form
- @hookform/resolvers

Install missing dependencies only when required by package.json.

## 5. Supabase Configuration

Create or open the GidaLink Trust project in Supabase.

Obtain:

- Project URL
- Publishable/anon client key appropriate to the project configuration

Create a .env file in the project root.

Example:

VITE_SUPABASE_URL=<https://YOUR_PROJECT.supabase.co>
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_CLIENT_KEY

Do not commit .env.

The frontend must never contain a service-role key.

## 6. Database Setup

Database migrations are stored in:

supabase/migrations/

Apply migrations using the project's selected Supabase workflow.

Review existing database objects before applying new migrations.

Confirm:

- Profiles table.
- Properties table.
- Enums.
- Constraints.
- Triggers.
- RLS policies.

Do not recreate objects that already exist without checking for conflicts.

## 7. Start Development Server

npm run dev

Open the local URL printed by Vite.

Usually:

<http://localhost:5173>

## 8. Run Production Build

npm run build

The TypeScript check and Vite production build must complete successfully.

## 9. Preview Production Build

npm run preview

## 10. Environment File Rules

.env:
Local secrets and project configuration.

.env.example:
Safe placeholder configuration for other developers.

Never commit real credentials.

## 11. Troubleshooting

### Missing Supabase environment variables

Check:

- .env exists.
- Variable names are correct.
- No accidental quotation or spelling errors.
- Vite was restarted after changing environment variables.

### Dependency errors

Try:

npm install

Do not delete package-lock.json without a clear reason.

### Build errors

Run:

npm run build

Fix TypeScript and Vite errors before proceeding.

### Database permission errors

Inspect:

- User session.
- Profile record.
- User role.
- RLS policies.
- Foreign key relationships.

Do not disable RLS as a quick fix.

## 12. Development Checklist

- [ ] Dependencies installed.
- [ ] Environment configured.
- [ ] Supabase connection established.
- [ ] Database migrations reviewed.
- [ ] Development server starts.
- [ ] Homepage loads.
- [ ] Production build passes.
