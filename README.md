# Bhandara Khao 🍛

**Find Bhandaras. Share Seva. Spread Happiness.**

A community platform to discover and share bhandaras, langars, free community meals and food seva events across India. Visitors browse without logging in. Registered members post events with photos and maps, and administrators moderate content.

## Features

- **Discover:** search by city, area, pincode or name; filters for date, distance, status, category, meal type, menu and verified organizers; list and map views; "near me" with browser location; URL-based filters
- **Event pages:** gallery, map, directions, Google Calendar, WhatsApp / native share, QR code, bookmarks with email reminders, reports, related events, privacy-aware contact details
- **Post and manage:** 6-step form with draft saving, map pin picker, image upload (compression, progress, reorder, cover photo), preview, edit, cancel, duplicate, delete
- **Accounts:** email and password, Google sign-in, email verification, password reset, dashboard, notifications and preferences, organizer verification requests
- **Admin:** stats, moderation queue, reports, users (suspend/reactivate), organizer verification, categories, audit log, editable site pages
- **Quality:** light/dark theme with no flash, mobile-first responsive UI, accessible forms and dialogs, PWA (installable, offline page, no stale event data), SEO pages and sitemap for crawlers

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, React Hook Form + Zod, Leaflet + OpenStreetMap, Lucide icons, react-hot-toast |
| Backend | Node.js, Express 4, MongoDB Atlas + Mongoose, JWT (HttpOnly cookie), bcrypt, Zod, Helmet, rate limiting |
| Services | Cloudinary (images), Nodemailer (email), Google Identity Services (sign-in) |

## Project structure

```
bhandara-khao/
├── client/                 React app (Vite)
│   ├── public/             manifest icons, offline.html, robots.txt
│   ├── scripts/            PWA icon generator
│   └── src/
│       ├── components/     ui/, map/, event/, event-form/, dashboard/, admin/, home/, explore/
│       ├── context/        AuthContext, ThemeContext
│       ├── hooks/  layouts/  pages/  routes/  services/  styles/  utils/
│       ├── App.jsx  main.jsx  sw.js
│       └── ...
├── server/
│   ├── config/             env (validated), db, cloudinary, mailer, defaults
│   ├── controllers/  routes/  services/  validators/  middleware/  models/
│   ├── jobs/               reminder cron
│   ├── scripts/            seed
│   ├── app.js  server.js
├── README.md  TESTING.md  .gitignore
```

## Prerequisites

- Node.js 18 or newer (20 recommended)
- Free accounts: MongoDB Atlas, Cloudinary, Google Cloud (for sign-in), and a Gmail account with an App Password (or any SMTP provider)

## 1. Set up the external services

**MongoDB Atlas**
1. Create a free cluster, then *Database Access* → add a user with a strong password.
2. *Network Access* → add your IP (for development) or `0.0.0.0/0` (for hosted deployments, protected by the user password).
3. *Connect* → *Drivers* → copy the connection string into `MONGODB_URI`, adding the database name (`/bhandara-khao`) before the `?`.

**Cloudinary**
1. From the dashboard, copy the Cloud name, API key and API secret into the three `CLOUDINARY_*` variables. The secret stays on the server only.

**Gmail SMTP**
1. Turn on 2-Step Verification, then create an App Password (Google Account → Security → App passwords).
2. Use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, your address as `SMTP_USER`, and the app password as `SMTP_PASS`.
3. Gmail allows roughly 500 emails a day. For a busy site, switch to a transactional provider (Brevo, Resend, Mailgun); only the SMTP variables change.

**Google sign-in**
1. Google Cloud Console → *APIs & Services* → *Credentials* → *Create credentials* → *OAuth client ID* → *Web application*.
2. Under *Authorized JavaScript origins* add `http://localhost:5173` and, later, your production URL. No redirect URI is needed.
3. Copy the Client ID into `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client).

## 2. Run locally

```bash
# Backend
cd server
cp .env.example .env        # fill in the values (Windows: copy .env.example .env)
npm install
npm run seed                # categories + site text (+ admin if ADMIN_EMAIL/ADMIN_PASSWORD are set)
npm run dev                 # http://localhost:5000

# Frontend (second terminal)
cd client
cp .env.example .env
npm install
npm run icons               # one-time: generates PWA PNG icons
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173. Categories are also created automatically on first start, so posting works even if you skip the seed.

### Optional demo data (development only)

```bash
cd server && npm run seed:demo
```

Creates five clearly marked `[DEMO]` events so you can try filters and maps. Re-running replaces them. It refuses to run when `NODE_ENV=production`. Delete them from the admin panel (or the database) before launch. The site never ships hardcoded events.

### Creating an admin

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters) in `server/.env`, then run `npm run seed`. If that email already has an account it is promoted to admin. Log in and open `/admin`.

## Environment variables

**Server (`server/.env`)**

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | no | `development` or `production` |
| `PORT` | no | default 5000 |
| `MONGODB_URI` | yes | Atlas connection string |
| `JWT_SECRET` | yes | 32+ random characters |
| `JWT_EXPIRES_IN` | no | default `7d` |
| `CLIENT_URL` | yes | allowed frontend origin(s), comma-separated, no trailing slash. The first is used in emails and sitemap links |
| `COOKIE_SAMESITE` | no | `lax` (default); see Deployment |
| `TRUST_PROXY` | no | proxies in front of the app: `1` default, `2` with the Vercel `/api` proxy |
| `GOOGLE_CLIENT_ID` | for Google sign-in | OAuth client ID |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | yes | image storage |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | yes | email |
| `AUTO_APPROVE_EVENTS` | no | `true` (default) publishes immediately; `false` sends new events to the moderation queue (verified organizers and admins are always auto-approved) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | used by `npm run seed` |

The server validates these at startup and exits with a clear message if something is missing.

**Client (`client/.env`)**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL including `/api` (`/api` in production behind the proxy) |
| `VITE_GOOGLE_CLIENT_ID` | enables the Google button (hidden when empty) |
| `VITE_SITE_URL` | public site URL for share links and canonical tags |
| `VITE_INSTAGRAM_URL`, `VITE_FACEBOOK_URL`, `VITE_X_URL`, `VITE_YOUTUBE_URL` | footer links, each shown only when set |

## NPM scripts

| Where | Script | Does |
|---|---|---|
| server | `npm run dev` / `npm start` | dev server (nodemon) / production |
| server | `npm run seed` / `seed:demo` | defaults and admin / demo events (dev only) |
| client | `npm run dev` / `build` / `preview` | dev / production build / serve the build |
| client | `npm run icons` | generate PWA icons from `public/favicon.svg` |

## API overview

All JSON. Success: `{ success: true, data, message? }`. Lists add `meta: { page, limit, total, totalPages }`. Errors: `{ success: false, message, errors?: [{ field, message }] }`. State-changing requests must send `X-Requested-With: XMLHttpRequest` (the client does this automatically).

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `login`, `google`, `logout`, `verify-email`, `resend-verification`, `forgot-password`, `reset-password`; `GET /api/auth/me` |
| Events | `GET /api/bhandaras` (filters), `/nearby`, `/featured`, `/categories`, `/stats`, `/cities`, `/suggest`, `/:slug`, `/:slug/related`; `POST /api/bhandaras`, `/images`, `/:id/view`, `/:id/duplicate`; `PATCH /:id`, `/:id/cancel`; `DELETE /:id`, `/images` |
| Me | `GET /api/users/me/bhandaras`; `PATCH /api/users/me`, `/me/password`; `POST/DELETE /api/users/me/avatar`; organizer verification under `/me/organizer-verification` |
| Bookmarks | `GET/POST/DELETE /api/bookmarks/:eventId`; `PUT/DELETE /api/bookmarks/:eventId/reminder` |
| Notifications | `GET /api/notifications`; `PATCH /:id/read`, `/read-all`, `/preferences` |
| Reports | `POST /api/reports` |
| Site text | `GET /api/settings/:key` |
| Admin (admin role only) | `/api/admin/dashboard`, `users`, `bhandaras`, `reports`, `organizers`, `categories`, `audit-logs`, `settings` |
| SEO | `GET /seo/sitemap.xml`, `/seo/bhandaras/:slug` |

## Security summary

- Passwords hashed with bcrypt (cost 12); reset and verification tokens are random, stored only as SHA-256 hashes, single-use and expiring
- JWT in an `HttpOnly`, `Secure` (production), `SameSite` cookie; sessions end when the password changes or the account is suspended
- CSRF defence: strict CORS allowlist plus a required custom header on all state-changing requests
- Roles are read from the database on every request, never from the client; admin routes check the role server-side; owners (or admins) only can edit or delete events
- Zod validation on every route, in-place `$`/`.` key stripping against NoSQL injection, HTML stripped from text fields, output rendered as text (no `dangerouslySetInnerHTML`)
- Helmet headers; rate limits on login, signup, password reset, email sending, uploads, event creation, reports, views
- Uploads: MIME allowlist, magic-byte check, 5 MB limit, resized and re-encoded server-side, stored under per-user Cloudinary folders; deletes verify ownership and happen only after the database change succeeds
- Contact details are filtered on the server according to the organizer's visibility choice
- Environment validated at startup; production errors never expose stack traces

## Deployment

The recommended setup: **API on Render (or Railway), frontend on Vercel**, with Vercel forwarding `/api/*` to the backend. The browser then talks to a single domain, so the login cookie is first-party and works in Safari and Firefox. Pointing the browser straight at a different domain (`SameSite=None`) is unreliable because those browsers block cross-site cookies.

### Backend (Render)

1. New **Web Service** from your Git repo. *Root directory:* `server`. *Build:* `npm install`. *Start:* `npm start`. Add the env var `NODE_VERSION=20`.
2. Environment variables: everything in the server table, with
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-app.vercel.app` (add a custom domain too, comma-separated, once you have one)
   - `COOKIE_SAMESITE=lax`
   - `TRUST_PROXY=2` (platform plus the Vercel proxy)
3. *Health check path:* `/api/health`.
4. Atlas *Network Access* must allow Render (`0.0.0.0/0` is simplest).
5. Run the seed once with production variables: from your machine `cd server && npm run seed` using the production `MONGODB_URI`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` (do **not** run `seed:demo` against production).

Notes: free Render instances sleep after inactivity, so the first request is slow and reminder emails only go out while the server is awake. Use a paid always-on instance for reliable reminders.

### Frontend (Vercel)

1. Import the repo. *Root directory:* `client`. Framework preset: Vite.
2. Environment variables: `VITE_API_URL=/api`, `VITE_GOOGLE_CLIENT_ID=...`, `VITE_SITE_URL=https://your-app.vercel.app`.
3. Edit `client/vercel.json` and replace `YOUR-API-HOST` with your Render host. This file provides the `/api` proxy, the SPA fallback, and the crawler rewrites that serve server-rendered event pages to Google and WhatsApp.
4. Edit `client/public/robots.txt` and set your real domain on the `Sitemap:` line.
5. Add your production URL to the Google OAuth client's *Authorized JavaScript origins*.

### After deploying

- Open `https://your-app.vercel.app/api/health`; it should return `{ "success": true, "status": "ok" }`.
- Run the checks in `TESTING.md` section 12 (production checks).
- **Rate limits and proxies:** log in wrongly from two different networks (e.g. Wi-Fi and mobile data). If one blocks the other, raise `TRUST_PROXY` by one. If a single user can bypass limits by sending a fake `X-Forwarded-For` header, lower it.
- Uploads pass through the Vercel proxy. The app compresses photos in the browser, so they are normally well under 1 MB, but test an upload on the live site. If it fails, serve the frontend and API from subdomains of one custom domain (`app.example.com` and `api.example.com`), which also makes cookies first-party without the proxy.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Server exits with "Invalid environment configuration" | A required variable is missing or invalid; the message names it |
| Category dropdown empty | Fixed automatically at start-up; restart the server |
| "Cannot reach the server" in the browser | wrong `VITE_API_URL`, server not running, or `CLIENT_URL` doesn't match the frontend origin exactly (scheme, host, port, no trailing slash) |
| `403 Missing or invalid request header` | a custom client is calling the API without `X-Requested-With: XMLHttpRequest` |
| Login works, then you're logged out on reload | cookie not stored: in production use the `/api` proxy with `COOKIE_SAMESITE=lax`, and HTTPS |
| Google button missing | `VITE_GOOGLE_CLIENT_ID` is empty; "origin not allowed" means the URL isn't in the OAuth client's authorized origins |
| Verification or reset emails never arrive | use an App Password (not your account password), check spam, and see the server log for "Email failed" |
| "One or more images are invalid" | the image URL host isn't `res.cloudinary.com/<your cloud name>`, e.g. a custom Cloudinary domain |
| Map tiles blank | an ad-blocker or firewall blocking `tile.openstreetmap.org` |
| All visitors rate-limited together | wrong `TRUST_PROXY` (see above) |

## Known limitations

- **Recurring events** are shown as a label ("Repeats weekly"); occurrences are not generated automatically. Use *Duplicate* to announce each new date.
- **Drafts** need the required fields filled in, because the API validates the full event.
- Photos that were uploaded but never saved are deleted when the user leaves the form. A crash or lost connection can leave a stray file in Cloudinary under `bhandara-khao/bhandaras/<userId>/`.
- Free-text search covers title, venue, area, city, state and organizer (not individual menu items).
- Default Privacy Policy and Terms text is a starting point. Review it, adapt it to your situation, and add real contact details before launch (Admin → Site content).