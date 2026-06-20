# HeroQuest MMO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser MMO-lite foundation matching HeroQuest MMO Version 1.1.

**Architecture:** Shared modules define game data and pure rules, the Socket.IO server owns online state and rewards, and the Three.js client renders a procedural 3D world with DOM UI and local solo fallback. Deployment config targets Render for the server and Netlify for the client.

**Tech Stack:** JavaScript, Three.js, Vite, Node.js, Express, Socket.IO, HTML, CSS, LocalStorage, Web Audio API, Netlify, Render.

---

### Task 1: Shared Game Contracts

**Files:**
- Create: `shared/constants.js`
- Create: `shared/items.js`
- Create: `shared/enemies.js`
- Create: `shared/zones.js`
- Create: `shared/quests.js`
- Create: `shared/abilities.js`
- Create: `shared/combat.js`
- Create: `shared/netMessages.js`

- [x] Define stable ids, stats, enemy tables, quests, zones, and pure combat helpers.
- [x] Add server tests that fail before shared modules exist.
- [x] Implement the shared modules and confirm tests pass.

### Task 2: Online Server

**Files:**
- Create: `server/src/server.js`
- Create: `server/src/RoomManager.js`
- Create: `server/src/WorldServer.js`
- Create: `server/src/PlayerState.js`
- Create: `server/src/EnemySystem.js`
- Create: `server/src/CombatSystem.js`
- Create: `server/src/LootSystem.js`
- Create: `server/src/PartySystem.js`
- Create: `server/src/BossSystem.js`
- Create: `server/test/systems.test.js`

- [x] Provide Express health endpoint and Socket.IO CORS setup.
- [x] Add player join, movement, zone travel, attack, ability, loot, quest, and party events.
- [x] Keep enemy health, boss state, and rewards server-authoritative where online.

### Task 3: Three.js Client

**Files:**
- Create: `client/index.html`
- Create: `client/src/main.js`
- Create: `client/src/styles/main.css`
- Create: `client/vite.config.js`
- Create: `client/.env.example`

- [x] Build menu, character creation, HUD, inventory, character panel, quest log, party panel, patch notes, settings, and pause surfaces.
- [x] Build Dawnrest, Greenvale Outskirts, and Shadow Peak from procedural geometry.
- [x] Add movement, sprint, dash, camera orbit, combat, Hero Pulse, loot collection, XP/leveling, equipment, quest progress, boss telegraphs, generated audio, and local saves.
- [x] Add Socket.IO sync and local solo fallback.

### Task 4: Deployment and Documentation

**Files:**
- Create: `render.yaml`
- Create: `netlify.toml`
- Create: `README.md`
- Create: `deploy/supabase_schema.sql`

- [x] Configure Render Node web service with `/health`.
- [x] Configure Netlify static Vite deploy.
- [x] Document local run, deployment, multiplayer, extension points, and limitations.

### Task 5: Verification and Commit

- [ ] Run `npm run install:all`.
- [ ] Run `npm run check`.
- [ ] Start server and verify `/health`.
- [ ] Start client and playtest in browser.
- [ ] Commit final tree to `fishansbdbs/HeroQuestMMO` on `main`.
