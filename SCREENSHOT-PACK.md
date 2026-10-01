# Manual screenshot pack — shot list (GRE-434)

Most Paige surfaces are captured automatically by the capture kit in the `paige` repo
(`apps/web/tests/content`), which produces the `.mp4` + poster pairs under `assets/videos/`.
This file covers the shots the capture kit **cannot** reach: Meta's own web UI, and a real
phone. Those have to be taken by hand.

**19 shots, in two sittings.** Sitting 1 is nine shots in a desktop browser against a Meta
Business account. Sitting 2 is ten shots on a physical handset. Nothing in sitting 2 depends
on sitting 1, so you can do them in either order — but do each sitting in one pass, because
both need setup you won't want to repeat.

Every slot in the docs is a `{/* TODO: … */}` MDX comment carrying the shot ID from this
file. Search the repo for the ID to find the slot. Keep the IDs in sync: if you rename a
shot here, rename it in the page.

## Before you start

**Where the files go.** `images/` does not exist yet, and there is no embedding convention
for stills in this repo — every asset today is a video under `assets/videos/`, embedded
through the `PageDemo` snippet. Decide that first (GRE-434 carries a proposal:
`assets/images/` plus an `images.manifest.json` mirroring the capture kit's
`demos.manifest.json`, so each still records the date it was shot). Meta's UI drifts with no
version to pin against, so the shot date is the only staleness signal these images will ever
have. Record it.

**Sizing.** The sibling media on these pages renders at `w-full aspect-video` — 16:9, full
content width. Match that for every desktop shot: **16:9, at least 1600 px wide**, cropped to
the browser viewport with no OS chrome, no bookmarks bar, no browser tabs. Handset shots are
the exception: take those at the phone's native portrait resolution and don't crop them to
16:9. A phone shot squeezed into a 16:9 box looks broken.

**Redact everywhere, every shot.** Before you take the shot, not after:

- **Phone numbers** — use a number you are happy to publish, or blur every digit after the
  country code. Both your connected number and any customer number count.
- **Business names and addresses** — shoot against a throwaway business ("Paige Demo Co" or
  similar), not a real client.
- **Tokens, IDs and secrets** — access tokens, WABA IDs, phone number IDs, webhook signing
  secrets, API keys, the two-step verification PIN. Blur or scroll out of frame.
- **Money** — credit balances, invoice amounts, card digits, Meta spend figures.
- **People** — real customer names, profile photos, email addresses, avatar initials.

**Theme.** Shoot Paige in light mode so the stills sit beside the existing clips without a
jarring switch. Meta's UI has no choice — take what Meta gives you.

---

## Sitting 1 — Meta's own UI (9 shots)

**What you need:** a desktop browser, a Facebook login, a Meta Business account, and a phone
number that is **not** already running as a WhatsApp account anywhere. Once a number is
registered you cannot re-shoot the signup flow with it, so if you only have one spare number,
read MET-01 through MET-06 end to end before you start clicking.

**Do them in this order.** MET-01 to MET-06 are one unbroken run through Meta's embedded
signup — you get one pass per number. MET-07 to MET-09 are separate Meta screens you can
reach any time afterwards.

### MET-01 — Embedded signup popup, first appearance

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Start Meta embedded signup*
- **Screen:** Meta's embedded-signup popup, in the state it opens in, sitting on top of the
  Paige dashboard. Either the Facebook login screen or Meta's intro screen, whichever Meta
  shows you first.
- **In frame:** enough of the Paige dashboard behind the popup to show it is a popup over
  Paige, not a page Paige rendered. The popup's own title bar and Meta branding.
- **Avoid:** a pre-filled Facebook email address. Log out of Facebook first if yours is
  remembered.

### MET-02 — Business portfolio screen

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Work through Meta's screens*
- **Screen:** the screen inside the popup that asks which business portfolio the WhatsApp
  account belongs to.
- **In frame:** both options — picking an existing portfolio and creating a new one. If Meta
  splits these across two screens, shoot the one with the choice on it.
- **Avoid:** the names of real portfolios in the picker list.

### MET-03 — WhatsApp Business Account screen

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Work through Meta's screens*
- **Screen:** the screen where you select an existing WhatsApp Business Account or create a new
  one.
- **In frame:** the selector and the business name attached to the WABA.
- **Avoid:** existing WABA names and any WABA ID.

### MET-04 — Business profile screen

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Work through Meta's screens*
- **Screen:** the screen collecting the WhatsApp business profile basics — business name, and
  website or description if Meta asks for them.
- **In frame:** the filled fields, so a reader can see what kind of detail Meta wants.
- **Avoid:** a real business name, a real website, a real address.

### MET-05 — Phone-number entry screen

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Work through Meta's screens*
- **Screen:** the screen where you enter the number you want to register, before you submit it.
- **In frame:** the country selector and the number field, filled.
- **Avoid:** a real number you aren't willing to publish. Blur the digits after the dialling
  code if in doubt.

### MET-06 — Verification-code screen

- **Fills:** `whatsapp-setup.mdx` → **Connect your number** → step *Work through Meta's screens*
- **Screen:** the screen asking for the verification code Meta sent, with the code boxes empty
  or partly filled.
- **In frame:** whichever verification methods Meta offered you for this number — Paige sends
  Meta no verification-method configuration, so the point of the shot is that the options are
  Meta's, not Paige's.
- **Avoid:** the full code. Leave the last digits blank or blur them, and never shoot the SMS
  itself.

### MET-07 — Security Centre, start verification

- **Fills:** `whatsapp-setup.mdx` → **Verifying your business** → *Starting verification from Paige*
- **Screen:** Meta Business Manager → your business portfolio → **Business settings → Security
  Centre**, with the **Start verification** button visible.
- **In frame:** the Security Centre heading and the **Start verification** button, so the path
  the prose describes is recognisable even after Meta renames it.
- **Avoid:** the real business name in the portfolio switcher, and any verification documents
  already uploaded.

### MET-08 — Payment settings for a WhatsApp Business Account

- **Fills:** `whatsapp-setup.mdx` → *Adding a payment method on Meta*
- **Screen:** Meta Business Suite → **Billing & payments → Payment settings**, scoped to a
  WhatsApp Business Account, showing where a payment method is added.
- **In frame:** the **Add payment method** control and enough of the surrounding page to show
  this is Meta's billing, not Paige's.
- **Avoid:** card digits, billing addresses, spend totals, any amount at all. Shoot an account
  with no payment method on file if you can — that is also the state the reader is in.

### MET-09 — Turning off two-step verification in WhatsApp Manager

- **Fills:** `whatsapp-setup.mdx` → **Changing your WhatsApp number** → the PIN warning
- **Screen:** WhatsApp Manager → **Account tools → Phone numbers**, with the gear menu open on
  a number so **Turn off two-step verification** is visible.
- **In frame:** the gear menu and the two-step verification item. This is a four-click path the
  prose has to spell out, which is exactly why a picture earns its place.
- **Avoid:** the number itself, the PIN, and any other numbers in the list.

---

## Sitting 2 — a real handset (10 shots)

**What you need:** a phone, a Paige account with a project on it, and — for CHAT-01 to CHAT-07
— a bot that can send each WhatsApp message type on demand. Build that bot before you pick up
the phone: seven message types is seven round trips, and you do not want to be writing bot code
one-handed.

Shoot at the phone's native portrait resolution. Do not crop to 16:9.

### HAND-01 — Paige installed on the home screen

- **Fills:** `guides/mobile-app.mdx` → *Install it*
- **Screen:** two states, so take **two frames and pick the better one**: the Android install
  prompt — **Install Paige — Add Paige to your home screen for the full app experience** — as
  it appears over Paige in Chrome; and the installed app open fullscreen, with no browser
  address bar. The second is the more useful shot if you only keep one, because "it opens like
  a real app" is the claim the page makes.
- **In frame:** the absence of browser chrome in the installed state. That is the whole point.
- **Avoid:** other apps' notification badges in the status bar, the carrier name if it
  identifies you, and any project name belonging to a real client.

### HAND-02 — Push notifications turned on, on the phone

- **Fills:** `guides/mobile-app.mdx` → *Notifications*
- **Screen:** **Settings → Notifications** inside the installed Paige app, with the **Push
  notifications** switch on, immediately after the browser's permission prompt was accepted. If
  you can catch the permission prompt itself over the switch, that is the better frame.
- **In frame:** the single **Push notifications** switch in its on state. One switch is the
  claim the page makes, so the shot should make the shortness obvious.
- **Avoid:** shooting this from a desktop browser — iPhone's disabled state and the *"Not
  supported on this browser"* text are a real part of the story, but this slot is the working
  case on an installed app.

### HAND-03 — Scanning the Share Your WhatsApp QR code

- **Fills:** `whatsapp-setup.mdx` → *Share your number*
- **Screen:** a phone camera pointed at the **Share Your WhatsApp** QR code on a desktop
  screen, and then WhatsApp opening with the pre-filled message already typed in the compose
  box. **Two frames:** the scan, and the opened chat.
- **In frame:** on the scan frame, enough of the Paige card to show which tab is selected —
  **Connected** or **Paige Dev**. On the chat frame, the pre-filled text sitting in the compose
  box, unsent, which is the behaviour the prose describes.
- **Avoid:** the number at the top of the chat, the display name if it is a real client's, and
  any other chats in the WhatsApp list behind it. Shoot the **Paige Dev** tab if that keeps a
  real number out of frame.

### CHAT-01 to CHAT-07 — the message-type gallery

- **Fills:** `learn/message-types.mdx` → the gallery placeholder near the top
- **Screen:** one in-chat WhatsApp screenshot per message type, all in the same conversation,
  same phone, same theme, so they read as a set:
  - **CHAT-01 — Text.** A plain message, no controls under it.
  - **CHAT-02 — Media.** An image with a caption. An image is the clearest of the three media
    kinds; a document is worth a second frame only if one shot cannot carry both.
  - **CHAT-03 — Reply buttons.** Three quick-reply buttons under one message, not one.
  - **CHAT-04 — List menu.** The **View options** button, and the scrollable list it opens.
    Shoot the open list — the closed button on its own tells the reader nothing.
  - **CHAT-05 — CTA / URL button.** A message with a link button under it.
  - **CHAT-06 — Flow.** The flow call-to-action in the chat, and the first screen of the form
    open inside WhatsApp.
  - **CHAT-07 — Template.** An approved template as it arrives, filled with real-looking values
    rather than `{{1}}`.
- **In frame:** the message bubble and its controls, cropped tight. No need for the whole phone
  screen.
- **Avoid:** the contact header with a number in it, timestamps that date the shot obviously,
  and the device status bar. Crop above the message and below the controls.
- **Note:** this slot currently holds a single placeholder describing all seven. Replace it with
  seven `<Frame>` blocks when the images land, matching the order of the tabs further down the
  page.

---

## Not in this pack

### Already covered

**The Paige not-connected panel** on `whatsapp-setup.mdx` needs no new shot. The capture kit
already drives that exact state for the `connect-whatsapp` clip, which ships in this repo
today. Pull a still from it, or embed the clip, rather than shooting it by hand. Its
placeholder says so.

### Automatable — for a follow-up ticket

Seventeen placeholders across the docs are Paige dashboard screens the existing capture kit
could drive headlessly. They are **not** in this pack and should not be shot by hand — a
hand-shot Paige screen goes stale with the next UI change and nothing tells you. They belong in
a capture-kit ticket instead:

| Placeholder | Page |
|---|---|
| Unverified **Business Verification** status with **Get verified** | `whatsapp-setup.mdx` |
| Payment-method reminder with **Check payment method** | `whatsapp-setup.mdx` |
| The connected state just after a successful connection | `whatsapp-setup.mdx` |
| **Danger Zone** with the **Disconnect** button | `whatsapp-setup.mdx` |
| The disconnect confirm dialog | `whatsapp-setup.mdx` |
| Broadcasting Agent approval card | `agents/broadcasting-agent.mdx` |
| Conversations Agent with a draft reply | `agents/conversations-agent.mdx` |
| **Settings → Usage** per-agent line items | `agents/overview.mdx` |
| Webhooks card with one registered webhook | `api-reference/webhooks.mdx` |
| Billing details card | `guides/billing.mdx` |
| Multi-select consent screen | `guides/connect-an-agent.mdx` |
| Connected agents card | `guides/connect-an-agent.mdx` |
| **Tools → Message Costs** as it opens | `guides/message-costs.mdx` |
| The real-traffic cost report headline | `guides/message-costs.mdx` |
| Code Agent sidebar mid-build | `guides/prompting.mdx` |
| **Deploy** with the pending-changes dot | `guides/troubleshooting.mdx` |
| **Forgot password?** on the sign-in page | `quickstart.mdx` |
