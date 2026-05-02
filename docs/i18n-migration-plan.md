# BookingME i18n Migration Plan

## Current Rule

New UI text should use stable dot keys instead of English sentences as translation keys.

Good:

```html
<a data-i18n="nav.home">Home</a>
<input data-i18n-placeholder="common.searchDestinations" placeholder="Search destinations...">
<img data-i18n-alt="attr.bookingHome" alt="BookingME home">
```

Avoid for new work:

```json
{
  "Book Now": "កក់ឥឡូវនេះ"
}
```

The old `text` section is still supported as a fallback so existing pages keep working while we migrate page by page.

## File Structure

Locales live in:

```txt
data/lang/en.json
data/lang/km.json
```

Use these sections:

```json
{
  "meta": {},
  "key": {},
  "text": {},
  "attr": {}
}
```

`key` is for stable UI text keys.  
`attr` is for stable attribute keys and temporary exact attribute fallback.  
`text` is legacy fallback for exact visible text.

## Migration Order

1. Header and footer
2. Home page
3. Places and property detail pages
4. Booking, payment, and confirmation pages
5. User dashboard
6. Host dashboard and add property pages
7. Support page

After a page is fully migrated to stable keys, remove its old exact English text entries from `text`.

## Check Command

Run this before committing translation changes:

```powershell
node tools\check-i18n.js
```

The checker verifies that stable `key` and `attr` entries match between English and Khmer.

## Data Rule

Do not add prices, dates, booking IDs, emails, or one-off user names to locale files unless they are fixed UI examples. Property/listing content should move toward data files with localized fields.
