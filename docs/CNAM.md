# CNAM — show the assistant's name on outbound calls

CNAM (Caller ID Name) displays up to **15 characters** on the recipient's phone
when your assistant places an outbound call (e.g. a test call or a callback).
The app registers it through **Twilio Trust Hub** with the display name set to the
**assistant's name** (sanitized to CNAM rules).

## How to use it

1. Open an assistant: **Dashboard → AI assistant → (select one)**.
2. It must have a Twilio number attached.
3. In **Caller ID name (CNAM)**, confirm the display name (defaults to the
   assistant name, max 15 chars) and click **Register CNAM**.

The display name is submitted for review; allow **48–72 hours** to propagate to
US carriers.

## Display-name rules (enforced by `sanitizeCnam`)

- Max 15 characters.
- Must begin with a letter.
- Only letters, numbers, periods, commas, and spaces.

## Requirements / limitations

- **US standard long-code numbers only.** Toll-free and CA numbers are not eligible.
- Requires an **approved Trust Hub Business Profile** on the account
  (Twilio Console → Trust Hub). Trial accounts and unapproved profiles cannot
  register CNAM — the app surfaces a clear error in that case.
- One CNAM display name per registered number.

## What the app does (Trust Hub REST API)

`registerCnam()` in [`lib/dashboard/twilio.ts`](../lib/dashboard/twilio.ts):

1. Finds an approved Customer (Business) Profile.
2. Creates a CNAM Trust Product (`policySid` = the CNAM policy).
3. Creates a `cnam_information` end user with `cnam_display_name`.
4. Assigns the business profile + end user to the Trust Product.
5. Assigns the phone number (`channelEndpointType: "phone-number"`).
6. Submits the Trust Product (`status: "pending-review"`).

## Env

```
# Optional: contact email used when submitting the CNAM Trust Product for review.
# Falls back to the Trust Hub business profile email.
CNAM_CONTACT_EMAIL=
```
