# IceZero Phase 6 Frostveil Reach

## Scope Completed

- Added `frostveil` as a Level 5 gated zone.
- Added the Greenvale portal to Frostveil Reach with the required rejection message for underleveled players.
- Added Frostveil camp waypoint unlock behavior.
- Added Frostveil Reach procedural client scene:
  - Snow-covered ground
  - Frozen trees
  - Ice crystals
  - Campfire waypoint
  - Frozen ward crystals
  - Frostveil treasure chest
- Added six Frostveil enemies:
  - Frost Slime
  - Ice Goblin
  - Snow Wolf
  - Frost Wisp
  - Ice Golem
  - Frozen Knight
- Added elite modifier metadata for armored, swift, chilling, and regenerating variants.
- Added Frostveil spawn tables for server and solo-local play.
- Added ice quest-chain progress for:
  - The Frozen Road
  - Cold Blooded
  - Howling White
  - Shattered Ward
  - Heart of the Blizzard
- Added multi-target quest progress support.
- Added event-based quest progress support.
- Added a lightweight Frost Ward public event that starts for nearby Frostveil players and spawns a tagged enemy wave.
- Added server validation for Frostveil travel, waypoint unlock, quest entry progress, and public event snapshots.
- Added Frostveil quest tracker filtering while in the Frostveil zone.

## Verification

- `npm.cmd test --prefix server`
- `npm.cmd run check`
- Fresh local server returned `/health` ok.
- Browser smoke using `?smoke=frostveil&phase6=frostveil&demo=frostward` confirmed:
  - Frostveil Reach rendered with canvas.
  - Frostveil quest tracker displayed the ice quest chain.
  - Frostveil camp waypoint unlocked.
  - Frostveil enemies spawned.
  - Frost Ward public event started.
  - Event enemy wave spawned.
  - No fatal console errors.

## Deferred To Later Phases

- Palace of Zero portal and lock requirements.
- Ice Mage boss arena and boss state machine.
- Public event reward distribution.
- Ward crystal manual interaction rewards.
- Full waypoint travel UI.
- Bestiary, achievements, and zone completion UI.
