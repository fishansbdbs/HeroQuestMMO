# HeroQuest MMO

HeroQuest MMO Version 1.2.1 is a small online fantasy MMO-lite for the browser. Players create a blocky hero, spawn in the hub town of Dawnrest, see other online players, travel to Greenvale Outskirts, fight monsters with an MMO hotbar, collect XP, coins, and loot, equip gear, join parties by code, complete starter quests, and challenge the Shadow Wyrm boss in Shadow Peak.

The game uses procedural blocky Three.js geometry, DOM UI, generated Web Audio sounds, LocalStorage saves, Socket.IO multiplayer, and simple server-authoritative combat/reward checks. There are no paid APIs, copyrighted assets, or external model dependencies.

## Project Structure

```text
client/       Vite + Three.js browser client
server/       Express + Socket.IO online server
shared/       Items, enemies, quests, zones, combat rules, net messages
deploy/       Optional future deployment/database notes
render.yaml   Render Blueprint for the server
netlify.toml  Netlify config for the client
```

## Run Locally

Install dependencies:

```bash
npm run install:all
```

Start the server:

```bash
npm run dev:server
```

Start the client in another terminal:

```bash
npm run dev:client
```

Open:

```text
http://localhost:5173
```

The client uses `VITE_SERVER_URL`. For local play, `client/.env.example` points to:

```env
VITE_SERVER_URL=http://localhost:3000
```

If the server is unavailable, the client falls back to solo local mode with local enemies, combat, loot, quests, and the boss fight.

## Controls

```text
WASD        Move
Mouse drag  Rotate camera
Shift       Sprint
Space       Dash
Left click  Select enemy, or basic attack if no enemy is clicked
E           Interact or collect loot
1           Toggle Auto Attack
2           Slash
3 / Q       Hero Pulse
4           Guard
5           Use health potion
6           Dash
I           Inventory
C           Character panel
P           Party panel
M           Quest log
Esc         Settings
```

## Online Multiplayer

The server syncs player names, colors, positions, zones, enemy health, loot drops, parties, and boss state. Combat remains intentionally high-ping friendly:

- Clients render movement and effects.
- The server validates approximate hit range.
- The server tracks enemy health and boss health.
- The server awards XP, coins, and loot for online kills.

To test locally, open two browser tabs at `http://localhost:5173` while the server is running. Create different character names and both players should appear in the same zone.

## Party System

Open the party panel with `P`.

1. One player creates a party code.
2. Friends enter that code to join.
3. Party size is limited to 4 players.
4. Party members are shown in the HUD when online.
5. Boss credit is shared by participation in the arena foundation.

## Quests

Starter quests are active from the quest board in Dawnrest:

- Slime Trouble
- Goblin Patrol
- First Hunt
- Stone in the Woods
- Shadow at the Peak

Quest progress saves locally and updates when enemies or the boss are defeated.

## Deploy Server To Render

The repository includes `render.yaml`.

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repo.
3. Render uses:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/health`
4. Set `CLIENT_ORIGIN` to the final Netlify URL.
5. After deploy, check:

```text
https://YOUR-RENDER-SERVER.onrender.com/health
```

It should return:

```json
{
  "ok": true,
  "service": "heroquest-mmo-server"
}
```

## Deploy Client To Netlify

The repository includes `netlify.toml`.

1. Create a Netlify site from this GitHub repo.
2. Netlify uses:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set:

```env
VITE_SERVER_URL=https://YOUR-RENDER-SERVER.onrender.com
```

4. Deploy the site.
5. Copy the Netlify URL back into Render as `CLIENT_ORIGIN`.

## Add New Enemies

Edit `shared/enemies.js`.

1. Add an enemy definition to `ENEMIES`.
2. Add it to a spawn table such as `FIELD_SPAWNS`.
3. If it uses a new visual family, add a renderer branch in `client/public/runtime/heroquest-runtime-2.js.txt` inside `createEnemyMesh`.
4. Run `npm run check`.

## Add New Items

Edit `shared/items.js`.

1. Add the item definition to `ITEMS`.
2. Reference the item from enemy or boss loot tables in `shared/enemies.js`.
3. If it changes stats, update `shared/combat.js`.
4. Run `npm run check`.

## Add New Zones

Edit `shared/zones.js` and `client/src/main.js`.

1. Add the zone definition to `ZONE_DEFS`.
2. Add a world builder function in the client.
3. Add portals to connect it to existing zones.
4. Add server spawn/state handling if the zone needs online enemies.

## Add New Bosses

Edit `shared/enemies.js`, `server/src/BossSystem.js`, and `client/src/main.js`.

1. Add the boss data.
2. Add server health, phase, attack, and reward handling.
3. Add a procedural silhouette and telegraphs on the client.
4. Add a quest target if needed.

## Add Quests

Edit `shared/quests.js`.

1. Add a quest entry with `targetFamily` or `targetEnemyId`.
2. Give it a coin, XP, item, or title reward.
3. The quest log and tracker pick it up automatically.

## Verification

Useful checks:

```bash
npm run install:all
npm run check
npm run start:server
```

Then visit `/health` on the server and play through menu, character creation, Dawnrest, Greenvale, combat, loot, inventory, quests, party UI, and Shadow Peak.

## Known Limitations

- There are no accounts or cloud character saves yet.
- Client movement is prediction-light and suitable for MMO-lite play, not twitch combat.
- Collision is intentionally simple around major props and arena bounds.
- Boss credit and party rewards are a foundation, not a full raid system.
- Art is procedural and stylized rather than detailed.
- The client runtime is shipped as loader plus public chunks for Version 1.2.1 speed; future versions should split renderer, UI, input, and world modules into first-class source modules as the game grows.
