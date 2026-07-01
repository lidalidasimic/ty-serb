# Ty-Serb Course Hub

Ty-Serb Course Hub is a modern course website for the “Ты-Серб курс” Serbian language course for Russian speakers. Lessons are stored in one editable TypeScript file, and each lesson can link out to an external presentation, worksheet, and Telegram post.

## Project structure

```text
app/                 Next.js app routes and pages
components/          Shared React components
data/                Editable lesson and testimonial data
lib/                 Server-side auth, access-control, and audit helpers
public/              Static images and assets
supabase/            Database migrations for access control
tests/               Access policy tests
package.json         Project scripts and dependencies
package-lock.json    Locked dependency versions
tailwind.config.ts   Tailwind theme and content paths
postcss.config.js    Tailwind/PostCSS setup
tsconfig.json        TypeScript configuration
next.config.ts       Next.js configuration
README.md            Project notes
```

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Access control

The first lesson is public demo content. Lessons 2+ and all material links are protected by server-side checks.

This project uses Supabase Auth and Supabase Postgres through server-side `fetch` calls, so no extra npm package is required. Add these variables locally and in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=your-email@example.com
```

Run the SQL migration in `supabase/migrations/001_access_control.sql` in the Supabase SQL editor. It creates:

- `profiles` with `pending / approved / rejected / revoked` access status
- `access_requests`
- `activity_events`

Existing non-admin profiles are moved to `revoked` by the migration so accounts are kept but protected access is removed until manually approved again.

Admin page:

```text
/admin
```

Users can register, login, and request access here:

```text
/register
/login
/access
```

Important: the website now hides and protects material links through backend routes such as `/api/materials/[slug]/gamma`. However, old public Gamma URLs cannot be revoked by this website. To fully protect lectures, make the Gamma pages private, rotate their public URLs, or move PDFs/videos into private storage with signed URLs.

### Supabase email rate limit

Registration is handled by Supabase Auth. If Supabase email confirmation is enabled and the project uses the built-in Supabase email sender, Supabase can return `email rate exceeded` after a small number of signup emails. This is a project-level email sending limit, not a bug in the registration form.

For real student registration, configure a custom SMTP provider in Supabase:

```text
Supabase Dashboard -> Authentication -> Emails / SMTP settings
```

Keep spam protection enabled, but use your own SMTP provider so several students with different email addresses can register one after another. The app maps this error to a user-friendly message and logs `auth_register_failed_email_rate_limit` for admin review.

## Edit lessons

All lesson content is in:

```text
data/lessons.ts
```

To add or change a lesson, edit the objects in the `lessons` array. Each lesson supports:

- `number`
- `slug`
- `title`
- `level`
- `topic`
- `description`
- `gammaLink`
- `homeworkLink`
- `telegramPostLink`
- `worksheetLink` — PDF worksheet URL. Leave as an empty string (`""`) to show “Скоро” instead of a clickable button.
- `vocabulary`
- `grammarFocus`
- `status`
- `extraNotes`

Use a unique `slug` for each lesson because it becomes the page URL, for example:

```text
/lessons/azbuka-i-proiznoshenie
```

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and choose **Add New Project**.
3. Import the repository.
4. Add the Supabase environment variables listed above in **Project Settings -> Environment Variables**.
5. Keep the default Next.js settings.
6. Click **Deploy**.

After deployment, update your real presentation, homework, email, and Telegram links.

## Tests

Run the access policy tests:

```bash
npm run test:access
```
