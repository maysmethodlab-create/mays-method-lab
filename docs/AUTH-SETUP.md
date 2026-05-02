# Auth setup — Google OAuth (interim) → TAMU CAS SSO (future)

The Mays Method Lab admin area uses **Sign in with TAMU Google** as the primary
authentication path, with a hidden shared-password fallback for local
development. Sign-in is enforced server-side to `@tamu.edu` accounts only
(verified email required).

This is an interim auth bridge. The production target is TAMU CAS SSO via the
NetID system; that migration requires registration with TAMU IT and is out of
scope for this guide.

---

## How the flow works

1. User visits `/login` and clicks **Sign in with TAMU Google**.
2. Browser is sent to `/api/auth/google/start`, which:
   - Generates a 32-byte CSRF state token
   - Stores it in an httpOnly `mml_oauth_state` cookie (5-minute lifetime)
   - Stores the post-login redirect target in `mml_oauth_next`
   - Redirects to Google's consent screen with `hd=tamu.edu` and
     `scope=openid email profile`
3. Google calls back to `/api/auth/google/callback`. The server:
   - Validates the returned `state` against the cookie
   - Exchanges the auth code for an access token (server-side only — secret
     never touches the browser)
   - Calls Google's userinfo endpoint and reads `email` + `email_verified`
   - Rejects anything that does not end in `@tamu.edu` or that has
     `email_verified !== true`
   - On success, sets the same `mml_session` cookie shape that the password
     flow produces, so all downstream admin routes work without modification
4. User lands on `/admin` (or whichever `next` path was captured).

The dev fallback (`/api/auth` POST with `ADMIN_PASSWORD`) is still wired for
local work without OAuth credentials. It is hidden behind a "Use admin password
(dev)" link on `/login`.

---

## Set up the OAuth client (one-time, done by Hari)

You need a Google Cloud project, an OAuth consent screen, and a Web
Application OAuth client. The whole thing takes about 10 minutes.

### Step 1. Create a Google Cloud project

1. Go to <https://console.cloud.google.com>
2. Sign in as `ssridhar@mays.tamu.edu`
3. Top bar → project picker → **New project**
4. Name: `Mays Method Lab`. Leave organization at the default (TAMU) if it
   appears, otherwise leave it as "No organization". Click **Create**.
5. Wait for the project to provision, then make sure it is selected in the
   project picker.

### Step 2. Configure the OAuth consent screen

1. Left nav → **APIs & Services** → **OAuth consent screen**
2. User type:
   - Choose **Internal** if Google shows the option (means the project is
     attached to a TAMU Google Workspace org and only TAMU users can sign in
     even before our server-side check). This is preferred.
   - If only **External** is offered, that is fine too. External means anyone
     with any Google account can attempt to sign in, but our server-side
     `@tamu.edu` check will block non-TAMU accounts before any session is
     issued. The end result is the same.
3. Click **Create**.
4. App information:
   - App name: `Mays Method Lab`
   - User support email: `ssridhar@mays.tamu.edu`
   - App logo: optional, skip for now
5. App domain:
   - Application home page: `https://mays-method-lab.onrender.com`
   - (Privacy policy and terms of service: optional, skip for v1)
6. Authorized domains: add both
   - `onrender.com`
   - `tamu.edu`
7. Developer contact: `ssridhar@mays.tamu.edu`
8. Save and continue.
9. Scopes screen: leave empty (we request `openid email profile` directly in
   the auth URL; no need to declare them here for basic profile scopes).
   Save and continue.
10. Test users (External only): add `ssridhar@mays.tamu.edu` and any other
    TAMU testers. You can publish the app later to remove the test-user
    requirement.
11. Back to dashboard.

### Step 3. Create the OAuth client ID

1. Left nav → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Mays Method Lab Production`
5. Authorized JavaScript origins:
   - `https://mays-method-lab.onrender.com`
6. Authorized redirect URIs:
   - `https://mays-method-lab.onrender.com/api/auth/google/callback`
7. Click **Create**.
8. Google shows the **Client ID** and **Client Secret**. Copy both into a
   secure place (1Password / Bitwarden / TAMU SecureNotes). You will paste
   them into Render in the next step.

### Step 4. Add the credentials to Render

1. Go to <https://dashboard.render.com>
2. Open the `mays-method-lab` service
3. Left nav → **Environment**
4. Add two environment variables:
   - `GOOGLE_OAUTH_CLIENT_ID` = (paste the Client ID)
   - `GOOGLE_OAUTH_CLIENT_SECRET` = (paste the Client Secret)
5. Click **Save Changes**. Render auto-redeploys.

### Step 5. Verify

1. Wait for the Render deploy to finish (about 2 minutes).
2. Open <https://mays-method-lab.onrender.com/login> in a private window.
3. Click **Sign in with TAMU Google**.
4. Sign in with `ssridhar@mays.tamu.edu`.
5. You should land on `/admin`.
6. Sign in attempts with a non-TAMU Google account should bounce back to
   `/login?error=domain` with a clear message.

---

## Local development

To test the Google flow locally:

1. In Google Cloud Console → Credentials, create a second OAuth client called
   `Mays Method Lab Local Dev` with:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
2. Add to your `.env.local`:
   ```
   GOOGLE_OAUTH_CLIENT_ID=<dev client id>
   GOOGLE_OAUTH_CLIENT_SECRET=<dev client secret>
   ```
3. Restart `npm run dev`.

If `GOOGLE_OAUTH_CLIENT_ID` is unset, the Google button still renders on
`/login` but redirects to `/login?error=oauth-not-configured`, which exposes
the password fallback. Local dev works fine without OAuth configured.

---

## Future: TAMU CAS SSO

When TAMU IT registers this service for CAS SSO, the migration plan is:

1. Add `/api/auth/cas/start` and `/api/auth/cas/callback` routes parallel to
   the Google routes.
2. Validate the CAS ticket and read the NetID from the validation response.
3. Store `{ netid, role, displayName }` in the session payload (will require
   bumping `buildSessionToken()` in `src/lib/auth.ts` to a JSON payload + HMAC).
4. Switch the primary login button to **Sign in with TAMU NetID** and demote
   the Google flow to a fallback.
5. Eventually remove the Google flow once CAS is stable.

The `src/lib/auth.ts` and `src/app/admin/layout.tsx` boundaries are designed
to make this swap a localized change. Only those two files plus the new CAS
routes should need to move.
