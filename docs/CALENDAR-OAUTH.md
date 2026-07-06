# Calendar OAuth setup (Google & Microsoft)

The assistant books appointments into a connected calendar during a call. Google
Calendar and Microsoft Outlook connect via OAuth — the customer clicks
**"Continue with Google / Microsoft"** on the Integrations page, authorizes with
their own account, and we store the returned tokens.

Those buttons only appear once **you** (the app operator) register an OAuth app
with each provider and set the client credentials in the environment. Until then
the card reads **"Coming soon"** in production (and shows the exact env var names
in development).

The booking adapters (`lib/call-engine/integrations/google.ts`,
`outlook.ts`), OAuth handler (`lib/dashboard/oauth.ts`), and the
`/api/integrations/[provider]/connect` + `/callback` routes are already wired —
setup is only registering the apps and setting env vars.

---

## 1. Set the base URL

Every redirect URI is built from `APP_BASE_URL`. Set it to your deployed origin
(no trailing slash):

```
APP_BASE_URL=https://app.yourdomain.com
```

Local development:

```
APP_BASE_URL=http://localhost:3000
```

---

## 2. Google Calendar

**Redirect URI to register:**

```
{APP_BASE_URL}/api/integrations/google/callback
```

**Steps:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create
   or pick a project.
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **APIs & Services → OAuth consent screen** → configure it (External),
   add the scope `https://www.googleapis.com/auth/calendar.events`, and add your
   test users while the app is in "Testing".
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   type **Web application**.
5. Under **Authorized redirect URIs** add the redirect URI above.
6. Copy the **Client ID** and **Client secret** into env:

```
GOOGLE_OAUTH_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxxxxxx
```

> To let real (non-test) users connect, publish the consent screen. Google may
> require verification because the Calendar scope is sensitive.

---

## 3. Microsoft Outlook / Microsoft 365

**Redirect URI to register:**

```
{APP_BASE_URL}/api/integrations/outlook/callback
```

**Steps:**

1. Go to the [Azure Portal](https://portal.azure.com/) → **Microsoft Entra ID →
   App registrations → New registration**.
2. **Supported account types:** "Accounts in any organizational directory and
   personal Microsoft accounts" (matches the `common` tenant we use).
3. **Redirect URI:** platform **Web**, value = the redirect URI above.
4. **Certificates & secrets → New client secret** → copy the secret **value**
   (not the ID).
5. **API permissions → Add a permission → Microsoft Graph → Delegated →**
   add `Calendars.ReadWrite` and `offline_access`.
6. Copy the **Application (client) ID** and the secret value into env:

```
MICROSOFT_OAUTH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_OAUTH_CLIENT_SECRET=xxxxxxxx
```

---

## 4. Verify

1. Redeploy (or restart `dev`) so the env vars load.
2. Open **Dashboard → Integrations**. The Google / Microsoft cards should now
   show **"Continue with …"**.
3. Click it, authorize, and confirm the card flips to **Connected**.
4. Place a test call and ask the assistant to book a time — it checks
   availability across every connected calendar and books into the primary one.

## Environment variable reference

| Variable | Required for | Notes |
|---|---|---|
| `APP_BASE_URL` | Both | Origin used to build redirect URIs |
| `GOOGLE_OAUTH_CLIENT_ID` | Google | From Google Cloud Credentials |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google | From Google Cloud Credentials |
| `MICROSOFT_OAUTH_CLIENT_ID` | Outlook | Azure "Application (client) ID" |
| `MICROSOFT_OAUTH_CLIENT_SECRET` | Outlook | Azure client secret **value** |

(A `CALENDLY_OAUTH_CLIENT_ID` / `_SECRET` pair is also supported by the OAuth
handler if Calendly is ever re-added to the catalog.)
