# Copywriter For You — website

Premium one-page website (Dutch) for the copywriting studio in Almere.
Zero-build front-end (HTML/CSS/vanilla JS) + a tiny Python API for
booking **requests** (a request is never auto-confirmed).

## Quick start
```bash
python3 server.py            # -> http://127.0.0.1:8000
```
No dependencies, no build step. Python 3.8+.

## Structure
```
index.html        all sections + booking/privacy dialogs (semantic HTML)
css/styles.css    "Inkt & Ivoor" design system (Fraunces + Manrope)
js/config.js      ALL editable content: business info, services, FAQ,
                  writing samples, time windows, integration endpoints
js/app.js         navigation, reveals, tabs, accordion, calendar,
                  booking flow, contact form, video, motion controls
server.py         static server + POST /api/booking-request & /api/contact
data/requests.jsonl   created at runtime; one JSON per submitted request
```

## Editing content
Everything the business may want to change lives in js/config.js
(services, examples, FAQ, day parts, phone, address, endpoints).
Photography for hero/why/about/video poster is in index.html
(and one poster URL in css/styles.css).

## Booking integration (modular)
js/config.js -> integrations:
1. **Default** "/api/booking-request" + "/api/contact" — works with
   server.py. Requests are validated server-side (length caps, date
   window, email/phone, honeypot, 6 req/min/IP) and appended to
   data/requests.jsonl with status "aangevraagd" and a reference id.
2. **Formspree** (static hosting): create two forms at formspree.io and
   set both endpoints to https://formspree.io/f/<id>. No keys in code.
3. **Disabled** "": the forms honestly tell visitors online submission
   is not active yet and offer phone + "copy my request" fallbacks.
To connect a real calendar later (Calendly/Cal.com), replace the
sendRequest() adapter in js/app.js or embed the provider in the modal.
Day parts are *preferences*, never published availability.

Read submissions: open data/requests.jsonl, or export to CSV:
```bash
python3 -c "import json,csv,sys;rows=[json.loads(l) for l in open('data/requests.jsonl')];w=csv.DictWriter(sys.stdout,fieldnames=sorted({k for r in rows for k in r}));w.writeheader();w.writerows(rows)"
```
The data/ directory and *.py / *.md files are blocked from HTTP access.

## Private order overview
For local use, start the server with credentials and open `/admin`:
```powershell
$env:ADMIN_USER = "admin"
$env:ADMIN_PASSWORD = "use-a-long-unique-password"
python server.py
```
The page reads requests through an authenticated server endpoint; `data/requests.jsonl`
is never served directly. Do not expose this development Basic Auth setup publicly
without HTTPS and a stronger production authentication layer.

## Deploy
- **Static + Formspree**: upload index.html, css/, js/ to Netlify,
  Vercel, GitHub Pages or any web host; configure Formspree endpoints
  in `js/config.js`. The checked-in default is intentionally disabled,
  so a static build never pretends that a booking was stored.
- **Full API**: run HOST=0.0.0.0 PORT=8000 python3 server.py on a VPS /
  Render / Railway behind a TLS reverse proxy (Caddy/nginx). Add HTTPS,
  backups of data/, and consider a CSP header. Set your real domain in
  a canonical link + og:url in index.html once known.

## Accessibility & performance
Native <dialog> focus traps, ESC/backdrop close, skip link, ARIA tabs/
radios/accordions, keyboard calendar, prefers-reduced-motion + a manual
"Animaties pauzeren" toggle, video pause button, lazy images with
srcset/sizes, fetchpriority hero, video loads only near the viewport
(muted, looped, poster fallback, skipped on save-data/reduced motion).
Contrasts: body text 16.4:1; the coral accent is used for large display
text and UI components only (WCAG-checked).

## Assets (verified, royalty-free)
- Photography: Unsplash (Unsplash License, no attribution required):
  hero pen 1455390582262-044cdead277a · desk 1488190211105-8b0e65b80b4e ·
  newspapers 1504711434969-e33886168f5c · typing poster 1486312338219-ce68d2c6f44d ·
  service thumbs 1542435503… 1434030216411… 1457369804613… 1523275335684…
  1522202176988… 1499750310107… 1505682634904…
- Video: Mixkit "Typing on a laptop, close up" (Mixkit Stock Video Free
  License): https://mixkit.co/free-stock-video/typing-on-a-laptop-close-up-1781/
- Fonts: Google Fonts — Fraunces & Manrope (OFL).
- Map: keyless Google Maps embed + the official directions URL.

## Notes
- No reviews, clients, awards, prices or e-mail addresses were invented.
- Sample texts are explicitly labelled fictional style samples.
- Have the privacy text reviewed for your situation before going live.