# A2P 10DLC — enabling SMS on US numbers

The receptionist texts a message alert to the owner's personal number when it
takes a message. On **US local (10-digit) numbers**, carriers require
**A2P 10DLC registration** for application-to-person SMS. Unregistered traffic is
heavily filtered or blocked — so production US texting needs this one-time
registration. It is **not a code switch**: it involves business vetting, a
campaign, fees, and carrier approval.

## Testing vs production

- **Trial accounts** can send SMS to **verified** numbers **without** A2P. That's
  enough to test the message-alert feature now — just verify your personal
  number in the Twilio console.
- **Production** US texting from a 10DLC number **requires** A2P registration.
- **Toll-free** US numbers use a separate **Toll-Free Verification** instead.
- **Non-US** numbers have their own country rules (often no A2P).

## Registration steps (Twilio Console → Messaging → Regulatory / TrustHub)

1. **Customer Profile (Brand)** — business legal name, EIN/Tax ID, address,
   website, contact. Submit for vetting.
2. **A2P Brand registration** — links to the Customer Profile (a small one-time
   fee; usually approved in minutes–hours).
3. **Messaging Service** — create one; it groups your sender number(s).
4. **A2P Campaign** — pick a use case (e.g. *Customer Care* / *Notifications*),
   provide sample messages and opt-in/opt-out language. Submit (campaign review
   is hours–days; monthly campaign fee applies).
5. **Add the number** to the Messaging Service.
6. Once the campaign is **approved**, set the Messaging Service SID below.

## Wiring it into this app

The engine already supports it. Once your Messaging Service is approved:

```
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

With that set, message alerts are sent **through the registered Messaging
Service** (`messagingServiceSid`) instead of the bare number — see
[lib/call-engine/telephony.ts](../lib/call-engine/telephony.ts) → `sendSms`.
Leave it unset for trial/testing (sends directly from the number).

## Programmatic registration (optional)

The whole flow is available via the Twilio API (TrustHub Customer Profiles, A2P
Brand Registrations, Messaging Services, `us_app_to_person` campaigns, and number
assignment). It still requires real business data and is **approval-gated**, so
it can't be a one-click action in the dashboard. If you want this automated,
it's a dedicated TrustHub integration — ask and it can be scaffolded.

References:
- A2P 10DLC overview: <https://www.twilio.com/docs/messaging/compliance/a2p-10dlc>
- Toll-Free Verification: <https://www.twilio.com/docs/messaging/compliance/toll-free-verification>
