<div align="center">
  <table width="100%">
    <tr>
      <td align="center" bgcolor="#050807">
        <img src="public/product%20name.png" alt="Zorofy" width="360" />
      </td>
    </tr>
  </table>
</div>

<h1 align="center">Zorofy</h1>
<p align="center">Discover your next favorite. Indian and international music, built for the way you listen.</p>

<p align="center">
  <a href="#getting-started">Get started</a> |
  <a href="#configuration">Configuration</a> |
  <a href="#features">Features</a> |
  <a href="#commands">Commands</a>
</p>

---

## About

Zorofy is a responsive music discovery and playback application focused on Indian and international music. It brings regional discovery, charts, releases, playlists, search, and playback together in one listening experience.

Music discovery uses the YouTube Data API v3. Playback uses the official YouTube IFrame Player API. The application does not extract direct audio URLs, download media, or bypass playback restrictions.

## Features

- **Regional discovery:** Hindi, Kannada, Telugu, Tamil, Malayalam, Punjabi, Bengali, Marathi, English, and international music.
- **Home dashboard:** Trending tracks, top charts, new releases, and featured playlists.
- **Search:** Search music videos, playlists, and artists, with pagination and debounced requests.
- **Playlists:** Browse playlist tracks and play a queue.
- **Playback controls:** Play, pause, seek, volume, repeat, shuffle, and next/previous navigation.
- **Account features:** Email/password sign-in, optional Google sign-in, favourites, and saved playlists.
- **Quota-aware requests:** Server-side caching and request deduplication reduce repeated API calls.
- **Responsive interface:** A compact player, expanded video view, accessible controls, and a branded loading experience.

Language discovery uses relevant search terms and regional relevance settings. The data API does not provide a dedicated music-language filter, so results can occasionally include other languages.

## Technology

- Next.js 14 App Router and React 18
- Tailwind CSS
- YouTube Data API v3 and official IFrame Player API
- MongoDB with Mongoose for accounts and saved user data
- NextAuth.js for credentials and optional Google OAuth sign-in
- Redux Toolkit and Redux Persist for player and preference state

## Getting started

### Requirements

- Node.js 18.17 or newer
- npm
- A Google Cloud API key with the YouTube Data API v3 enabled
- MongoDB for account, favourite, and playlist features

### Install

```bash
git clone <repository-url>
cd <repository-folder>
npm ci
```

Create your local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Fill in the values in `.env.local` using the configuration guide below, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

### Music discovery

Create an API key in Google Cloud Console and enable **YouTube Data API v3** for the project. Add the key to `.env.local`:

```dotenv
YOUTUBE_API_KEY=your_server_side_api_key
```

The key is read by server-side API routes and should not use a `NEXT_PUBLIC_` prefix. Restrict it to the YouTube Data API. For server-to-server use, an IP restriction is appropriate when the server has a stable egress IP; HTTP referrer restrictions are for browser-origin requests.

### MongoDB accounts

Create a MongoDB Atlas cluster or use an existing MongoDB server. Add its connection string and database name:

```dotenv
MONGODB_URI=mongodb+srv://<database-user>:<password>@<cluster-host>/zorofy?retryWrites=true&w=majority
DB_NAME=zorofy
```

Allow your development IP in the cluster's network access settings. URL-encode special characters in the database username or password. `MONGODB_URL` is also accepted for compatibility; `MONGODB_URI` is preferred.

Without a MongoDB connection, browsing and playback can still be used, but account creation, sign-in, favourites, and saved playlists are unavailable.

### Session security

Set a stable NextAuth secret and the local application URL:

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<stable-random-secret>
```

Generate a secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Keep the secret private and do not change it between restarts, or existing sessions will be invalidated. The project checks `JWT_SECRET` as a legacy fallback if `NEXTAUTH_SECRET` is not set.

### Optional Google sign-in

Google sign-in is enabled only when both OAuth credentials and MongoDB are configured.

1. Create a **Web application** OAuth client in Google Cloud Console.
2. Add `http://localhost:3000` as an authorized JavaScript origin.
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
4. Add the credentials to `.env.local`:

   ```dotenv
   GOOGLE_CLIENT_ID=<your-client-id>
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   ```

5. Restart the application.

The redirect URI must exactly match the one registered with Google. For production, use your HTTPS site domain and register `https://<your-domain>/api/auth/callback/google`. Keep the client secret server-side and never expose it with a `NEXT_PUBLIC_` variable. See the [Google provider setup](https://next-auth.js.org/providers/google) and [Google OAuth web server guide](https://developers.google.com/identity/protocols/oauth2/web-server).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. Run `npm run build` first. |
| `npm test` | Run the automated regression tests. |
| `npm run lint` | Run Next.js lint checks. |

## Project structure

```text
src/
  app/          Pages, layouts, and server API routes
  components/   Shared interface, discovery cards, and player
  models/       MongoDB/Mongoose schemas
  redux/        Player, loading, and preference state
  services/     Music API, player, and playlist helpers
  utils/        Authentication, database, and shared utilities
public/         Brand artwork, icons, and static assets
tests/          Automated regression tests
```

## API usage and playback

The server requests only the fields required to render results and caches successful discovery responses. Search waits for the user to pause typing, shares identical in-flight requests, and paginates using API page tokens. Search and video metadata use `search.list` and `videos.list`; playlist discovery and track retrieval use `playlists.list` and `playlistItems.list`.

Playback stays inside the official embedded player. Zorofy controls are synchronized with the player state; unavailable, private, or non-embeddable videos may not play.

## Troubleshooting

- **Music service configuration error:** Check that `YOUTUBE_API_KEY` is present, the API is enabled for its Google Cloud project, and the key restrictions allow server requests.
- **Search limit or quota message:** The key may have reached a rate or daily quota limit. Wait for the quota window to reset or review quota usage in Google Cloud Console.
- **Account storage configuration message:** Set `MONGODB_URI`, confirm the MongoDB user/password and network access list, then restart the server.
- **Google redirect error:** Confirm the OAuth client is a web application and that the callback URI exactly matches `NEXTAUTH_URL` plus `/api/auth/callback/google`.
- **Playback unavailable:** The video owner or platform may disallow embedding, or the video may no longer be available.

## License

This project is licensed under the [MIT License](LICENSE).
