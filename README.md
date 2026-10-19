# BacklogHQ

BacklogHQ is a personal game library and backlog tracker. Organize the games
you want to play, keep track of what you are playing or have completed, and
review your progress from a data-driven dashboard.

## Features

- Add, edit, and delete games in a personal library.
- Track each game's status: Wishlist, Backlog, Playing, Completed, or Dropped.
- Search, filter, and sort games by title, status, platform, genre, priority,
  release year, rating, and date added.
- View game details, including platform, genres, release year, notes, priority,
  rating, and total playtime.
- Log dated play sessions with hours and optional notes.
- Save a 1–5 star rating and review for each game.
- View collection statistics, status distribution, top genres, and recent play
  sessions on the dashboard.
- Persist data in the browser with localStorage.
- Use a responsive dark interface on desktop and mobile.

## Built with

- React
- Vite
- Tailwind CSS
- React Router

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Run the production build and lint checks:

```sh
npm run build
npm run lint
```

## Data storage

BacklogHQ stores its data in the current browser's localStorage. The library is
local to that browser and is not synchronized across devices.
