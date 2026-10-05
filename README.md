# Siddhu × Mani — Our Journey

Interactive travel map for tracking:

- 🟢 Completed trips
- 🟠 Planned / upcoming trips
- 🟣 Trips still to be planned

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current V1

The current front-end is intentionally data-driven. Trip records live at the top of `src/App.jsx`, so adding or changing a destination does not require redesigning the map.

The next product layer can move these records into Supabase/PostgreSQL and add authentication, shared crews, day-by-day itineraries, live updates, photos, budgets, expenses and public trip URLs.

## Trip status flow

`wishlist → upcoming → completed`

The map marker color follows the status automatically.

- Green = completed
- Orange = planned/upcoming
- Purple = to be planned
