# Twilio phone numbers — formats & supported prefixes

What kind of number you can point at the AI receptionist, and how the prefixes
work. The engine only needs a **voice-capable** Twilio number; Media Streams
(the realtime audio transport) works on every voice number.

## Format: E.164 only

Store and configure every number in **E.164**: a `+`, the country code, then the
subscriber number, digits only.

```
+14155550142     US
+442079460958    UK
+421900123456    Slovakia
```

- No spaces, dashes, or parentheses.
- Max 15 digits after the `+`.
- The dashboard validates this (`^\+[1-9]\d{6,15}$`).

The **caller's** number can be from anywhere in the world — only the receptionist
number you buy from Twilio has to be voice-capable.

## Number types (and their prefixes)

Twilio sells several types; which exist depends on the country.

| Type | Typical prefix | Notes |
|---|---|---|
| **Local** | Area/city code (e.g. US `+1 415`, London `+44 20`) | Most common. Voice + SMS in most countries. |
| **Toll-Free** | US/CA `+1 800 / 888 / 877 / 866 / 855 / 844 / 833`; UK `+44 800 / 808` | Caller pays nothing. Good for inbound reception. |
| **Mobile** | Country mobile ranges (e.g. UK `+44 7…`) | Needed where mobile-origination matters (SMS deliverability, some countries). |
| **National** | Non-geographic national range | Country-wide, no city tie. Availability varies. |

> Short codes (5–6 digit SMS codes) are **not** voice numbers — don't use them
> here.

## Country codes Twilio commonly offers voice numbers in

Representative, not exhaustive — availability and type vary by country and change
over time. Verify with the API (below) before assuming.

```
+1    US / Canada            +44   United Kingdom
+1    (toll-free 8xx)        +49   Germany
+33   France                +31   Netherlands
+34   Spain                 +39   Italy
+43   Austria               +41   Switzerland
+48   Poland                +420  Czech Republic
+421  Slovakia              +46   Sweden
+45   Denmark               +47   Norway
+358  Finland               +353  Ireland
+61   Australia             +64   New Zealand
+81   Japan                 +65   Singapore
+852  Hong Kong             +972  Israel
+55   Brazil                +52   Mexico
+27   South Africa          +91   India (restricted)
```

Some countries (e.g. India, and many EU local numbers) require a **regulatory
bundle** — proof of address or local presence — before the number can be
provisioned. Twilio prompts for this at purchase.

## Verify what's actually available (API)

Don't guess — ask Twilio. List voice-capable numbers for a country:

```bash
# Local, voice-enabled, in the US
curl -G "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/AvailablePhoneNumbers/US/Local.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "VoiceEnabled=true" \
  -d "SmsEnabled=true"

# Toll-free in the US
curl -G "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/AvailablePhoneNumbers/US/TollFree.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "VoiceEnabled=true"
```

Swap `US` for any ISO country code (`GB`, `DE`, `SK`, `AU`…) and `Local` for
`TollFree`, `Mobile`, or `National`. Each result carries a `capabilities` object
— make sure `voice: true`.

The country list itself: `GET /AvailablePhoneNumbers.json`.

## Requirements for this app

- The number must have **`capabilities.voice = true`**.
- Point its **Voice webhook** at `${APP_BASE_URL}/api/twilio/voice` (and optional
  status callback at `/api/twilio/status`).
- Media Streams (used by the call engine) needs no special number feature — it
  works on any voice number, in any region.
- Set the number's E.164 value as the `e164` of the matching `phone_numbers` row
  in the dashboard so inbound calls resolve to the right config.

## References

- Available Phone Numbers API: <https://www.twilio.com/docs/phone-numbers/api/availablephonenumberlocal-resource>
- Phone number regulations by country: <https://www.twilio.com/en-us/guidelines>
- E.164 formatting: <https://www.twilio.com/docs/glossary/what-e164>
