# Relentless Frames — website

A static photography portfolio site. No build step, no dependencies, no server
required: open `index.html` in a browser and it runs.

The structure, navigation model and filmstrip carousel follow the layout of
senawastudio.com. All identity, copy, code and imagery here are original —
nothing was copied from that site.

---

## Files

```
index.html              the whole site — one page, hash-routed
assets/css/site.css     all styling
assets/js/site.js       router, carousel, drawer, search, project data
assets/img/             102 placeholder photographs + the Rf monogram
```

Routes are hash-based:

```
#/                              home carousel
#/work                          all 15 shoots, flat, filterable by category
#/work/wedding                  a category page (story, facts, its 3 shoots)
#/work/wedding/marissa-cole     one shoot, with its gallery
#/studio  #/process  #/contact
```

`#/work` lists every shoot directly (no click-through needed to browse them
all), with chips for All + the five categories along the top. Unlike the
reference's All/Commercial/Residential tags — which just filter the same
grid, since there's no separate page behind "Residential" — each RF
category chip is a real link to its own page (`#/work/<cat>`), because each
category carries genuine content: a story, and pricing-relevant facts
(typical coverage, delivered frames, turnaround). Clicking "Wedding" takes
you there; that page then lists just its own shoots.

Because routing is hash-based the site works from a plain file path and from
any static host, with no server rewrite rules.

---

## Replacing the placeholder photographs

Every image in `assets/img/` is a generated placeholder. Swap them for real
files of the same name and the site picks them up — no code changes needed.

**Per category** — `wedding`, `portraits`, `events`, `church-worship`,
`lifestyle-candid`:

| File | Used on | Suggested size |
|---|---|---|
| `<cat>-hero.jpg`  | home carousel + category page header | 2000 × 1250 |
| `<cat>-thumb.jpg` | Work index card | 1000 × 700 |

**Per shoot** — fifteen of them, slugs listed in `SHOOTS` in `site.js`
(`marissa-cole`, `the-jewel-box`, `night-shift`, `easter-sunday`, …):

| File | Used on | Suggested size |
|---|---|---|
| `<shoot>-hero.jpg`  | shoot page header | 2000 × 1250 |
| `<shoot>-thumb.jpg` | card in the category listing | 1000 × 700 |
| `<shoot>-01.jpg`    | plate, full width | 1600 × 1000 |
| `<shoot>-02.jpg`    | plate, full width | 1600 × 1000 |
| `<shoot>-03.jpg`    | plate, portrait | 1100 × 1400 |
| `<shoot>-04.jpg`    | plate, full width | 1600 × 1000 |

Plus `studio-01.jpg` (1800 × 1125) and `studio-02.jpg` (1200 × 1500) on the
Studio page.

Heroes are cropped with `object-fit: cover`, so keep the subject away from the
extreme edges — the top and bottom get trimmed on wide screens.

### Letting the studio owner swap photos himself

Every image the site displays is actually looked up through
`assets/data/images.json` first, and only falls back to the filenames
above if that file is missing an entry (or the whole file is absent) — so
replacing files by hand, as described above, still works exactly as
before and needs no extra setup.

If you'd rather give the owner a simple login page where he uploads
photos himself with no file access at all, this project already includes
a ready-to-go admin (`admin/`, built on Decap CMS) that edits
`images.json` for him. It takes a bit of one-time setup involving a
GitHub repository and a small free login helper — see **`CMS-SETUP.md`**
for the exact steps.

---

## Editing content

Everything editable lives at the top of `assets/js/site.js`:

- **`STUDIO`** — name, tagline, email, phone, city, Instagram handle.
  The email is currently the placeholder `studio@relentlessframes.com`;
  change it there and it updates the footer, the Contact page and the
  enquiry form's mailto in one go. The phone number is set to the studio's
  real number and updates the footer's `tel:` link and the Contact page's
  Telephone field the same way.
- **`PROJECTS`** — the five service categories, in the order they appear in
  the home filmstrip and as filter chips on the Work index. Each has a
  `slug` (must match the image filenames), `title`, `discipline`, `place`, a
  `duration` shown in the filmstrip meta line, a one-line `blurb` for the
  home carousel, a `story` array of paragraphs, and a `facts` object
  rendered as the definition list on the category page.
- **`SHOOTS`** — the fifteen individual shoots, and what the Work index
  actually lists. Each has a `cat` (must match a `PROJECTS` slug), its own
  `slug` (must match its image filenames), `title`, `venue`, `when`, a
  one-line `blurb`, a `story` array and a `facts` object.
- **`PROCESS`** — the four numbered stages.

To add a shoot: append an object to `SHOOTS` with the right `cat`, and drop
six images named after its slug into `assets/img/`. It appears in the Work
grid (and its category chip's count goes up), in that category's page and
next/previous loop, and in search — automatically.

To add a category: append an object to `PROJECTS`, add two images
(`<cat>-hero.jpg`, `<cat>-thumb.jpg`), and add shoots pointing at it.

---

## Interaction notes

- **Home**: the whole stage is a drag surface. Click-drag or swipe left to
  move to the next category, right to go back; the filmstrip follows your
  pointer and snaps to whichever label lands nearest the centre on release.
  A short fast flick carries one step. Trackpad horizontal scroll and the
  left/right arrow keys do the same thing. Enter opens the current category,
  as does clicking the label that is already centred. Clicking a filmstrip
  label directly (rather than dragging to it) navigates straight to that
  category's page.
- The bar along the bottom is a position indicator, not a countdown — it
  shows how far through the five you are.
- Autoplay drifts forward every 6.8 seconds until you touch it, then stops
  for good and leaves you in control.
- **Escape** closes the menu drawer or the search overlay.
- **Search** covers both categories and individual shoots, matching title,
  venue, date and blurb.
- **Work category chips** are links, not filters — clicking one (or a
  category label on the home filmstrip) navigates to that category's own
  page.
- **Shoot gallery**: arrows and thumbnails switch the plate on click; the
  active thumbnail scrolls into view. Left/right arrow keys do the same
  thing whenever a shoot page is open (and don't interfere with the home
  carousel's own arrow-key handling).
- Respects `prefers-reduced-motion` — animation and autoplay reveal effects
  drop out for viewers who ask for that.

---

## Fonts

Sora (display) and Inter (UI) load from Google Fonts over the network. If you
need the site to work fully offline, download both families, drop the woff2
files into `assets/fonts/`, and replace the `<link>` in `index.html` with
`@font-face` rules. The CSS fallback stacks mean nothing breaks in the
meantime — the type just renders in the system sans.

---

## SEO, favicon & sharing

`index.html` carries a favicon (built from `assets/img/rf-mark.svg`, the Rf
monogram, rasterized into `favicon.svg` / `.ico` / `favicon-16.png` /
`favicon-32.png` / `apple-touch-icon.png`), Open Graph and Twitter Card tags,
a canonical link, and a `ProfessionalService` JSON-LD block. `robots.txt`
allows all crawlers.

Before launch, update in `index.html`:
- the `relentlessframes.com` URLs in the canonical link, `og:url`, `og:image`
  and JSON-LD `url` — to the real deployed domain
- the JSON-LD `email` — still the placeholder `studio@relentlessframes.com`;
  the real value in `STUDIO` (`site.js`) updates every page automatically,
  but the JSON-LD block is static markup and needs its own edit. `telephone`
  in the JSON-LD block has already been set to the studio's real number
  (`+15739532532`), matching `STUDIO.phone` in `site.js` — keep the two in
  sync if the number ever changes again

One limitation worth knowing: because routing is hash-based (`#/work/...`),
search engines generally index the site as a single URL rather than crawling
each category or shoot page separately. That's the trade-off for a
zero-build, zero-server static site — if per-page SEO for individual shoots
ever matters, it would need real routes and either a static export per page
or server-side rendering.

---

## Deploying

It is a static folder, so anything works: Netlify or Vercel (drag the folder
in), GitHub Pages, Cloudflare Pages, or plain shared hosting over FTP. There
is nothing to compile and no environment variables to set.

If you want the owner photo-admin described above, host on GitHub Pages
from a GitHub repository — that's what `CMS-SETUP.md` walks through.
