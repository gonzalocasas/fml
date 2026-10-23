# FML — Family Meal League

A mobile-first, peer-to-peer family recipe picker. Swipe right to vote, then let
the meal board settle dinner.

## How it works

- The app is a static, installable PWA hosted on GitHub Pages.
- Profiles, votes and settings persist locally in IndexedDB.
- Devices in the same family room discover one another through credential-free
  signaling and exchange an append-only vote log over WebRTC.
- No application server or paid database is required.

The default room is `<hostname>-<YYYY-MM-DD>`, using the date in Europe/Zurich.
Visitors on the same hostname automatically share a room, which changes at Zurich
midnight (including while the app is open). An explicit `?room=...` link overrides
the daily room and stays fixed. Rooms are public and do not require authentication.
Changing rooms does not clear locally stored votes.

```bash
npm install
npm run dev
```

The production build expects to be served from `/fml/`.
