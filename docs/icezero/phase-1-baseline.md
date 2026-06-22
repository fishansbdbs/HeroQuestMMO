# IceZero Phase 1 Baseline

## Branch Safety

- Feature branch: `feature/icezero-v2`
- Base version: `v1.2.4`
- Base commit: `420f555ac6694a40ea04b3a7c9f0da6e85e2d6e6`
- Main branch remains the production branch and must not receive partial IceZero work.
- IceZero development checkpoints should be committed only to `feature/icezero-v2` until all critical acceptance tests pass.

## Current Architecture Notes

- Client runtime is Vite built and Netlify hosted from `client`.
- Server runtime is Socket.IO based and Render hosted from `server`.
- Shared registries live under `shared` for abilities, combat, constants, enemies, items, movement, networking, quests, and zones.
- Current deployment files are `netlify.toml` and `render.yaml`.
- The existing live systems to preserve include movement, combat, equipment, shops, quests, treasure chests, NPC dialogue, death recovery, boss telegraphs, parties, local saves, Netlify client deployment, Render server deployment, and `/health`.

## Baseline Verification

The following checks passed before broader IceZero feature work:

- `npm.cmd run install:all`
- `npm.cmd run check`
- `npm.cmd run build --prefix client`
- `npm.cmd start --prefix server`
- `Invoke-RestMethod http://127.0.0.1:3000/health`
- Local client loaded at `http://127.0.0.1:5173/`
- Main menu rendered with `v1.2.4` and no fatal browser console errors.
- Game world rendered through `?smoke=hub&baseline=phase1`.
- HUD and online status rendered.
- Debug state reported version `1.2.4`, zone `hub`, and the sword parented to the hand anchor.
- Two Socket.IO clients connected, saw each other, and received a movement snapshot.

## Save Migration Phase 1 Tests

Added regression coverage for the IceZero save migration contract:

- Legacy saves keep name, color, level, XP, coins, inventory, equipment, opened chests, quest progress, titles, and settings.
- Existing players receive retroactive attribute and skill points from level using the IceZero formulas.
- The old free `hero_pulse` unlock is removed once and grants a one-time 100-coin refund.
- Repeated migration does not duplicate migration IDs, points, coins, or inventory.
- Corrupted raw saves keep a backup and fall back to a safe starter save without zero HP, NaN mana, or negative points.

## Phase 1 Scope Boundary

This checkpoint adds the migration test harness and minimal migration utility only. It does not yet wire IceZero progression into the client runtime or server player lifecycle; that belongs to Phase 2.
