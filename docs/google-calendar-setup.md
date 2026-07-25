# Google Calendar setup (external users)

How to make "Connect Google Calendar" work for **any** Google account, not just
accounts inside your own Google Workspace organisation.

The whole integration is two env vars plus a redirect URI registered with Google.
Everything else is already in the repo.

| Piece | Where it lives |
| --- | --- |
| Provider definition (auth URL, token URL, scope) | `lib/dashboard/oauth.ts:13` |
| Start of the flow | `app/api/integrations/[provider]/connect/route.ts` |
| Callback / token exchange | `app/api/integrations/[provider]/callback/route.ts` |
| Calendar reads + writes | `lib/call-engine/integrations/google.ts` |

Scope requested: `https://www.googleapis.com/auth/calendar.events` (single scope,
Google classifies it as **Sensitive**). This matters for step 4.

---

## 1. Create a Google Cloud project

1. Go to <https://console.cloud.google.com/>.
2. Top bar project picker -> **New project**.
3. Name it something recognisable (it becomes the default app name users see on
   the consent screen, e.g. `AI Receptionist Now`). Create.
4. Make sure the new project is selected in the top bar before continuing.

The Google account you use here is just the *owner* of the app. It does not
restrict who can connect - that is decided in step 2.

## 2. Enable the Google Calendar API

1. **APIs & Services -> Library**.
2. Search "Google Calendar API" -> **Enable**.

Without this, the token exchange succeeds but every call in
`lib/call-engine/integrations/google.ts` comes back `403`.

## 3. Configure the OAuth consent screen as External

This is the step that decides "inside vs outside the organisation".

1. **APIs & Services -> OAuth consent screen** (newer console: **Google Auth
   Platform -> Branding** / **Audience**).
2. **User type: External.**
   - *Internal* = only accounts in your Workspace domain can ever authorise. It
     is also only offered if the Cloud project belongs to a Workspace org. If you
     signed up with a plain `@gmail.com` account, External is your only option
     and that is exactly what you want.
   - *External* = any Google account can authorise, subject to the publishing
     status in step 4.
3. Fill in the app information:
   - **App name** - shown on the consent screen. Use your product name.
   - **User support email** - a real address you monitor.
   - **App logo** (optional). Uploading a logo triggers **brand verification**,
     which takes days. Skip it until you actually need it.
4. **Authorised domains** - add the apex domain of `APP_BASE_URL`, e.g.
   `aireceptionistnow.com`. Not the full URL, no `https://`, no subdomain.
5. **Developer contact information** - your email. Google sends verification and
   deprecation notices here.
6. Save.

### Scopes

1. On the consent screen -> **Scopes** -> **Add or remove scopes**.
2. Add exactly `https://www.googleapis.com/auth/calendar.events`.

Do not add `.../auth/calendar` (full read-write on calendar *settings*) - it is a
**Restricted** scope and drags you into a third-party security assessment (CASA)
that costs money and weeks. `calendar.events` is only *Sensitive*.

Note the trade-off already baked into the code: because `calendar.events` cannot
call `calendars.get` or `calendarList`, `checkConnection()` derives the connected
account's email from `events.list` instead - the primary calendar's title or a
self-owned event's organiser (`lib/call-engine/integrations/google.ts:231`). If
you ever widen the scope you can simplify that, but see the warning above.

## 4. Publishing status: Testing vs In production

External apps have two states, and this is where most people get stuck.

### Testing (default)

- Only Google accounts you explicitly add under **Audience -> Test users** can
  connect. Cap: **100 test users**.
- Everyone else gets `Error 403: access_denied` -
  *"<app> has not completed the Google verification process."*
- Refresh tokens issued in Testing mode **expire after 7 days**. Your background
  refresh in `refreshAccessToken()` will start returning `null` and calendar
  writes will silently fail with `google calendar not authorized`. This is the
  single most common "it worked last week" bug.

Fine for development. Not fine for customers.

### In production

- **Audience -> Publish app**.
- Any Google account can connect. Refresh tokens no longer expire on a 7-day
  timer.
- Because you use a Sensitive scope, unverified production apps show an
  **"Google hasn't verified this app"** interstitial and are capped at **100 new
  users**. Users can still get through via *Advanced -> Go to <app> (unsafe)*.
- To remove the warning and the cap, submit for **verification**:
  **Audience -> Prepare for verification**. You will need:
  - A verified domain in Google Search Console, owned by the same account.
  - A homepage on that domain that describes the app.
  - A **privacy policy URL** on the same domain (this repo has
    `app/(main)/privacy-policy/page.tsx`).
  - A **demo video** (unlisted YouTube) showing: the OAuth consent screen with
    the scopes visible, and what the app does with the calendar data afterwards.
  - A written justification for `calendar.events`. Something like: *"The
    assistant books, reschedules and cancels appointments on the user's calendar
    during a phone call, and reads busy intervals to avoid double-booking."*

  Sensitive-scope review typically takes **2-6 weeks**. Restricted scopes would
  add a CASA assessment on top - another reason to stay on `calendar.events`.

**Do this before you onboard real customers**, not after. The 7-day refresh
token expiry in Testing mode will break every connected account you migrate.

## 5. Create the OAuth client credentials

1. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**.
2. Application type: **Web application**.
3. Name: anything, e.g. `aireceptionistnow web`.
4. **Authorised redirect URIs** - add one per environment. The path is built by
   `redirectUri()` in `lib/dashboard/oauth.ts:95` as
   `${APP_BASE_URL}/api/integrations/google/callback`:

   ```
   https://aireceptionistnow.com/api/integrations/google/callback
   https://<your-vercel-preview>.vercel.app/api/integrations/google/callback
   http://localhost:3000/api/integrations/google/callback
   ```

   Exact string match - trailing slashes, `http` vs `https` and the port all
   matter. A mismatch gives `Error 400: redirect_uri_mismatch`.

   `localhost` is allowed over plain `http`; any other host must be `https`.
5. Leave **Authorised JavaScript origins** empty - the flow is server-side only.
6. Create, then copy the **Client ID** and **Client secret**.

## 6. Wire up the environment

`.env.local` for local dev, and the same three in your hosting provider's env
settings for production:

```bash
GOOGLE_OAUTH_CLIENT_ID=<client id>.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=<client secret>
APP_BASE_URL=http://localhost:3000        # production: https://aireceptionistnow.com
```

`isOAuthConfigured("google")` returns false unless **all three** are set, and the
Connect button then bounces back with *"google login is not configured"*
(`app/api/integrations/[provider]/connect/route.ts:24`).

`APP_BASE_URL` is doing double duty: it builds the redirect URI *and* it decides
whether the `oauth_state` cookie gets the `secure` flag. On production it must
start with `https`, or the CSRF cookie is sent in the clear.

Restart `next dev` after editing `.env.local` - env vars are read at process
start.

## 7. Verify the flow

1. `npm run dev`.
2. Sign in, go to **Dashboard -> Calendar** (or the onboarding calendar step).
3. Click **Connect Google Calendar**. You should land on Google's consent screen
   showing your app name and *"See, edit, share, and permanently delete all the
   calendars you can access using Google Calendar"*.
4. Approve. You come back to `/dashboard/calendar?connected=1`.
5. The page shows the connected account email and live events - that is
   `checkConnection()` and `listEvents()` both succeeding against real Google.

Force a full re-consent at any time by revoking at
<https://myaccount.google.com/permissions> and reconnecting.

## Why the flow always asks for consent

`authParams` for Google is `{ access_type: "offline", prompt: "consent",
include_granted_scopes: "true" }` (`lib/dashboard/oauth.ts:17`).

`prompt=consent` is deliberate: Google only returns a `refresh_token` on the
*first* authorisation unless you force the consent screen every time. Without it,
a user who reconnects gets an access token that dies in an hour and no way to
refresh - `exchangeCode` would store `refresh_token: undefined` and every
background booking would fail. Keep it.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `Error 400: redirect_uri_mismatch` | Redirect URI in the console is not byte-identical to `${APP_BASE_URL}/api/integrations/google/callback`. Check scheme, port, trailing slash. |
| `Error 403: access_denied`, "has not completed verification" | App is in Testing and this Google account is not in the test-user list. |
| `google login is not configured` | One of the three env vars missing, or the dev server was not restarted. |
| Worked for a week, now `google calendar not authorized` | Testing-mode refresh token hit its 7-day expiry. Publish the app. |
| `google calendar 403` on every call | Calendar API not enabled on the project (step 2). |
| `google calendar 401` repeatedly | Refresh token revoked by the user, or the client secret was rotated. Reconnect. |
| "Login session expired or invalid" | `oauth_state` cookie missing - usually a cross-site cookie block, or `APP_BASE_URL` scheme not matching the actual origin. |
| Connected but no account email shown | Expected on a brand-new calendar with no self-owned events; `checkConnection()` has nothing to derive the address from. |

## Multi-tenant note

Each connecting customer authorises **your** OAuth client against **their** own
Google account. You need exactly one Cloud project and one OAuth client for the
whole product - not one per customer. Per-user credentials land in the calendar
integration row (`upsertCalendarIntegration`), keyed to the owner id.
