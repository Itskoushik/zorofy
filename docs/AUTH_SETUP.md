# Account and Google sign-in setup

## Required account database

Email/password accounts and Google accounts are saved in MongoDB. Create a MongoDB Atlas cluster (or use an existing MongoDB server), create a database user, and allow your development IP in the cluster's Network Access settings. Add the connection string to `.env.local`:

```dotenv
MONGODB_URI=mongodb+srv://<db-user>:<db-password>@<cluster-host>/zorofy?retryWrites=true&w=majority
DB_NAME=zorofy
```

URL-encode special characters in the database username or password. Restart the app after editing `.env.local`.

## Enable Google sign-in

1. In Google Cloud Console, select or create a project and configure the OAuth consent screen.
2. Create an OAuth client with application type **Web application**.
3. For local development, add `http://localhost:3000` as an authorized JavaScript origin and `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
4. Add the OAuth client credentials to `.env.local`:

```dotenv
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<a-stable-random-secret>
```

5. Restart the app. The Google sign-in button appears only when both Google credentials and the MongoDB connection are configured.

For production, use your real HTTPS domain in `NEXTAUTH_URL`, add that domain as an authorized JavaScript origin, and register `https://<your-domain>/api/auth/callback/google` as the redirect URI. Keep the client secret server-side; never use a `NEXT_PUBLIC_` prefix for it.

Generate a stable NextAuth secret with `openssl rand -base64 32`. Do not change it between restarts, or existing sessions will be invalidated.
