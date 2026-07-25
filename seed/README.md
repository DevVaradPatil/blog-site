# Seed images

Drop cover images into `seed/images/posts/` using the **exact base filename** below.
The extension is up to you — the seed script globs for `<name>.*` and accepts
`.jpg`, `.jpeg`, `.png`, `.webp` or `.avif`.

**Nothing here is required.** Any post without a matching file gets a deterministic
gradient cover instead, which looks intentional rather than broken. Add images
whenever you like and re-run the seed — it's idempotent.

## Specs

| | |
|---|---|
| Aspect ratio | 16:9 (landscape) |
| Ideal size | 1600×900 or larger |
| Max file size | 5 MB (matches the upload cap) |
| Formats | jpg · jpeg · png · webp · avif |

Cloudinary re-encodes on upload (capped at 2000px, `quality:auto`, `format:auto`),
so don't bother optimising by hand — upload the best quality you have.

## The 12 covers

| Filename | Post | What the image should show |
|---|---|---|
| `crop-advisory` | Kisan Mitra: An Offline-First Crop Advisory App | Indian farmer holding a phone in a field, or a crop close-up |
| `retinopathy-scan` | Detecting Diabetic Retinopathy with a Lightweight CNN | Retinal fundus scan, or a medical imaging / eye screening setup |
| `ar-campus-navigation` | Indoor AR Wayfinding for a College Campus | Phone held up with AR overlay/arrows, or a campus corridor |
| `smart-irrigation` | Solar-Powered Smart Irrigation with Soil Sensors | Drip irrigation lines, solar panel beside a field, soil sensor |
| `portal-ux-case-study` | Redesigning Our College Portal: A UX Case Study | Wireframes, sticky-note affinity mapping, or a design workspace |
| `air-quality-dashboard` | Predicting Local Air Quality with Open Data | City skyline in haze, or an analytics dashboard with charts |
| `qr-waste-bins` | A Zero-Waste Campus: QR-Tracked Segregation Bins | Colour-coded recycling bins, waste segregation station |
| `web-security-pentest` | Hardening a Student Web App: What a Pentest Taught Us | Terminal with code, padlock/security imagery, or a dark IDE |
| `music-streaming-app` | Melodia: A Music Streaming PWA Built with Next.js | Music player UI on a phone, headphones, waveform |
| `line-following-robot` | Line-Following Robot with PID — and Why Ours Oscillated | Small Arduino/chassis robot on a black-line track |
| `placement-data-viz` | Scraping and Visualising 10 Years of Placement Data | Charts/graphs on a screen, data visualisation, or a career fair |
| `dev-portfolio` | My DevVerse: Building a Portfolio That Gets Replies | Developer desk setup, portfolio site on a laptop screen |

## Avatars

**None needed.** Seeded users get a deterministic initials-on-gradient avatar
generated from their name, using the same palette logic as the post covers.

## Licensing

Please use images you have the right to publish — Unsplash, Pexels and Pixabay
are all fine for this. Avoid Google Image results, which are mostly copyrighted.
