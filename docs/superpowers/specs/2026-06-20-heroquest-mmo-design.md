# HeroQuest MMO Version 1.1 Design

## Product Shape

HeroQuest MMO is a practical browser MMO-lite foundation. Players create a local hero, spawn in Dawnrest, see other online players, travel to Greenvale Outskirts, fight procedural monsters, collect loot, equip gear, complete starter quests, party by code, and challenge the Shadow Wyrm boss in Shadow Peak.

## Architecture

The project is split into `client`, `server`, and `shared`. Shared modules define enemy, item, quest, combat, ability, zone, and message contracts. The server owns Socket.IO presence, enemy health, rewards, loot claims, parties, and boss state. The client owns rendering, input prediction, UI, local saves, audio, and a solo fallback simulation when the server is unavailable.

## Runtime

The client is a vanilla Vite + Three.js app with DOM HUD and menu overlays. All visuals are procedural low-poly geometry or CSS, so there are no external art assets or paid APIs. The server is Express + Socket.IO with a `/health` endpoint and configurable CORS for local development plus the production Netlify origin.

## Gameplay Scope

Version 1.1 includes three zones, five normal enemy families, a Stone Golem mini-boss, a Shadow Wyrm boss silhouette, melee attacks, Hero Pulse, XP, coins, equipment, inventory, loot bags, starter quests, party UI, settings, patch notes, and generated Web Audio cues. Systems are intentionally simple and readable so future zones, bosses, items, quests, and events can be added without rewriting the foundation.

## Testing

Server tests cover combat math, enemy rewards, loot generation, quest progress, and party codes. Build verification covers the Vite client. Browser playtesting checks first launch, character creation, world load, movement surfaces, HUD visibility, and console health.
