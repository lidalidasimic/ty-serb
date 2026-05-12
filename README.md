# Ty-Serb Course Hub

Ty-Serb Course Hub is a modern course website for the “Ты-Серб курс” Serbian language course for Russian speakers. Lessons are stored in one editable TypeScript file, and each lesson can link out to an external presentation, worksheet, and Telegram post.

## Project structure

```text
app/                 Next.js app routes and pages
components/          Shared React components
data/                Editable lesson and testimonial data
public/              Static images and assets
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
4. Keep the default Next.js settings.
5. Click **Deploy**.

After deployment, update your real presentation, homework, email, and Telegram links.
