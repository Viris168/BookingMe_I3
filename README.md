# BookingME

BookingME is a responsive hotel, room rental, and property booking website for Cambodia. The project is built with HTML, CSS, and JavaScript, with shared partials for the header/footer, bilingual English/Khmer translation support, user dashboard pages, host dashboard pages, and a connected booking flow.

## Features

- Home page with destination sections, featured stays, search, and connected property cards
- Shared header and footer loaded dynamically across pages
- English and Khmer language switching with JSON translation files
- User dashboard for profile, booking status, booking history, favorites, and account settings
- Host dashboard for overview, properties, booking requests, and property publishing
- Add Property wizard with four connected steps
- Property detail page with gallery, amenities, map, booking card, reviews link, and payment flow
- Payment page with booking summary and secure checkout UI
- Confirmation page with receipt action, booking status link, home link, and map directions
- Support page for help, policies, and contact-style routing

## Main Page Flow

```text
Home
  -> Bookings / Listings
  -> Places
  -> Support
  -> Property Detail
       -> Reviews
       -> Payment
            -> Confirmation
                 -> Booking Status

User Account
  -> Profile
  -> Booking Status
  -> Booking History
  -> Favorites
  -> Settings
  -> Host Mode

Host Mode
  -> Host Dashboard
  -> Host Properties
  -> Host Bookings
  -> Add Property Step 1
       -> Step 2
       -> Step 3
       -> Step 4
       -> Listing Success
```

## Project Structure

```text
BookingME/
  assets/
    flag/                 # Language flag images
    icons/                # Logo and UI icons
    images/               # Property and dashboard images
  component/
    dashboard/            # User dashboard pages
    host/                 # Host dashboard and add-property pages
    Login/                # Login/register page
    partials/             # Header, footer, booking, payment, detail, reviews
    places/               # Places/search page
    support/              # Support page
  css/
    _design-tokens.css    # Shared colors, fonts, radius, shadow tokens
    home.css
    host.css
    Property-Detail.css
    payment.css
    confirmation.css
    places.css
    reviews.css
    style.css
    support.css
  data/
    lang/                 # en.json and km.json translation dictionaries
    product.json          # Property listing data
  docs/
    i18n-migration-plan.md
  img/                    # Homepage destination/listing images
  js/
    components/           # Layout, listing, place, payment, property detail JS
    dashboard.js
    i18n.js
  tools/
    check-i18n.js         # Translation key checker
  index.html
```

## How To Run Locally

Because this project uses `fetch()` to load shared partials and JSON files, open it through a local web server instead of double-clicking `index.html`.

From the project root:

```powershell
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

If Python is not available, you can use any static server, for example the VS Code Live Server extension.

## Important Pages

| Area | Page |
| --- | --- |
| Home | `index.html` |
| Listings | `component/partials/booking.html` |
| Places | `component/places/places.html` |
| Property Detail | `component/partials/Property-Detai.html` |
| Payment | `component/partials/Payment.html` |
| Confirmation | `component/partials/Comfirmation.html` |
| Support | `component/support/support.html` |
| Login/Register | `component/Login/index-login.html` |
| User Dashboard | `component/dashboard/profile.html` |
| Host Dashboard | `component/host/host-dashboard.html` |
| Add Property | `component/host/add-property-step-1.html` |

Note: Some filenames currently keep the original project spelling, such as `Property-Detai.html` and `Comfirmation.html`, so links should continue using those names unless the files are renamed across the whole project.

## Translation System

The bilingual system is powered by:

- `js/i18n.js`
- `data/lang/en.json`
- `data/lang/km.json`

Use these attributes in HTML when adding new translated text:

```html
<h1 data-i18n="home.hero.title">Discover Cambodia's Best Stays</h1>
<input data-i18n-placeholder="common.searchDestinations" placeholder="Search destinations...">
<img data-i18n-alt="property.imageAlt" alt="Property image">
```

When adding new UI text, update both language files. You can verify translation structure with:

```powershell
node tools\check-i18n.js
```

## Validation Commands

Run these before pushing or merging:

```powershell
node tools\check-i18n.js
node --check js\i18n.js
node --check js\components\layout.js
node --check js\components\Payment.js
node --check js\components\Pro-Detail.js
```

Optional link check idea:

```powershell
Select-String -Path (Get-ChildItem -Recurse -File -Include *.html,*.js | ForEach-Object FullName) -Pattern '<<<<<<<|=======|>>>>>>>'
```

## Current Connected Processes

- Header navigation connects to Home, Bookings, Places, Support, user account pages, and Host Mode.
- Homepage listing cards connect to property detail pages.
- Property detail pages connect to reviews and payment.
- Payment connects to confirmation.
- Confirmation connects back to home and booking status.
- User dashboard sidebar connects all user dashboard pages.
- Host dashboard/sidebar connects overview, properties, bookings, user dashboard, and home.
- Add Property pages are connected from Step 1 through Listing Success.

## Design Notes

- Shared design tokens live in `css/_design-tokens.css`.
- The main font stack is Inter for English and Kantumruy Pro for Khmer.
- Use the shared blue brand color as the primary action color.
- Use real links for page navigation and buttons only for in-page actions.
- Add descriptive `alt` text and `loading="lazy"` for content images.

## Team Workflow

Before merging your branch:

1. Pull or merge the latest `main` into your feature branch.
2. Resolve conflicts carefully, especially shared files like `header.html`, `footer.html`, `i18n.js`, and language JSON files.
3. Run the validation commands above.
4. Click through the main flows in the browser.
5. Push your branch and create/merge the pull request.

## Project Status

BookingME is currently a static frontend project. It uses local JSON and browser storage for demo behavior. A future backend can replace the static data layer for authentication, real booking records, payments, host listings, and user profiles.
