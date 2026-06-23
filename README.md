# Iris

> Listen, together.

A quiet shared listening space. Not a music player — a room where you invite
someone to listen to music with you.

## Domain language

| Technical      | Iris      |
| -------------- | --------- |
| Room           | Echo      |
| User           | Listener  |
| Queue          | Garden    |
| Current Song   | Bloom     |
| Activity Feed  | Ripples   |
| Host           | Conductor |

## Structure

```
iris/
  backend/    Spring Boot 3 · Java 21 · WebSocket · Redis
  frontend/   React · TypeScript · Vite · Tailwind
```

### Backend packages

```
com.iris.echo        Echo lifecycle (create / join)
com.iris.garden      The shared queue
com.iris.listener    Presence
com.iris.bloom       The currently playing track
com.iris.websocket   Real-time events
com.iris.config      Configuration (Redis, CORS, etc.)
com.iris.youtube     Search + playback metadata
```

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind
- **Backend:** Spring Boot 3, Java 21, WebSocket
- **State:** Redis (Echo state, Garden, Listeners, Bloom)
- **Music:** YouTube IFrame API
- **Search:** YouTube Data API

## Configuration

Secrets are read from the environment, never committed. Copy the template and
fill in your values:

```
cp backend/.env.example backend/.env   # then edit backend/.env
```

Load it into your shell before starting the backend:

```
set -a; source backend/.env; set +a
```

| Variable          | Description                          | Default |
| ----------------- | ------------------------------------ | ------- |
| `YOUTUBE_API_KEY` | YouTube Data API key (enables search)| —       |

Without `YOUTUBE_API_KEY`, search is disabled gracefully (returns *“Search isn’t
set up yet”*); the rest of the app works.

## Build order

1. Repository structure
2. Backend skeleton
3. Frontend skeleton
4. Echo creation
5. Echo joining
6. WebSocket connectivity
7. Listener presence
8. YouTube search
9. Garden
10. Bloom playback
11. Synchronization
