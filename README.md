# BookingME

BookingME is a hotel, room rental, and property booking website focused on stays in Cambodia. The website includes a guest booking experience, user dashboard, host dashboard, add-property flow, and English/Khmer language support.

## Project Overview

BookingME helps users browse places to stay, view property details, make a booking, and manage their account. It also allows hosts to manage listings, review booking requests, and publish new properties.

The project is built with:

- HTML
- CSS
- JavaScript
- Tailwind CSS CDN
- JSON data

## Main Features

- Home page with search, Cambodia destinations, featured stays, and top destinations
- Dynamic property data from `data/product.json`
- Property listing page with filters and pagination
- Places page with map and location-based property browsing
- Property detail page with gallery, amenities, map, price summary, and booking action
- Payment page and booking confirmation page
- User dashboard for profile, booking status, booking history, favorites, and account settings
- Host dashboard for overview, properties, bookings, and property management
- Add Property flow with four steps
- English and Khmer language switching
- Shared header and footer across pages

## Website Flow

```text
Home
  -> Listings
  -> Places
  -> Property Detail
  -> Payment
  -> Confirmation

User
  -> Profile
  -> Booking Status
  -> Booking History
  -> Favorites
  -> Account Settings

Host
  -> Host Dashboard
  -> Host Properties
  -> Host Bookings
  -> Add Property
  -> Listing Success
```

## Important Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Listings | `component/partials/booking.html` |
| Places | `component/places/places.html` |
| Property Detail | `component/partials/Property-Detai.html` |
| Payment | `component/partials/Payment.html` |
| Confirmation | `component/partials/Comfirmation.html` |
| Login/Register | `component/Login/index-login.html` |
| Support | `component/support/support.html` |
| User Profile | `component/dashboard/profile.html` |
| Booking Status | `component/dashboard/Booking-status.html` |
| Booking History | `component/dashboard/Booking-history.html` |
| Favorites | `component/dashboard/favorite.html` |
| Account Settings | `component/dashboard/account-setting.html` |
| Host Dashboard | `component/host/host-dashboard.html` |
| Host Properties | `component/host/host-properties.html` |
| Host Bookings | `component/host/host-bookings.html` |
| Add Property | `component/host/add-property-step-1.html` |

## Main Folders

```text
assets/      Images, icons, logo, and flags
component/   Website pages and reusable partials
css/         Stylesheets for each page section
data/        Property data and language files
img/         Homepage image assets
js/          JavaScript for layout, data rendering, dashboard, booking, and translation
```

## Data

Property listings are stored in:

```text
data/product.json
```

The dataset includes Cambodia-only stays for both:

- Campus/student rooms
- Hotels and private stays

## Language Support

BookingME supports:

- English
- Khmer

Language files:

```text
data/lang/en.json
data/lang/km.json
```

The language switcher is handled by:

```text
js/i18n.js
```

## Project Status

BookingME is currently a static frontend project. It uses local JSON data and browser-side JavaScript to simulate booking, dashboard, host, and translation features.
