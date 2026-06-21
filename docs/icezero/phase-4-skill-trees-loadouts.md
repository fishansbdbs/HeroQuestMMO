# IceZero Phase 4 Skill Trees and Loadouts

## Scope Completed

- Added data-driven skill trees for:
  - Might
  - Arcana
  - Restoration
- Added skill node metadata with stable IDs, max ranks, descriptions, prerequisites, and capstone placeholders.
- Added shared validation for:
  - Skill point spending
  - Prerequisite checks
  - Max-rank prevention
  - Loadout save slots
  - Loadout activation
  - Owned equipment checks
  - Learned ability checks
  - Out-of-combat loadout guard
- Added server Socket.IO handlers for:
  - Skill node purchase
  - Loadout save
  - Loadout activation
- Added Skill Tree panel opened with `N`.
- Added Loadouts panel opened with `B`.
- Added two loadout slots: A and B.

## Verification

- `npm.cmd run check`
- Fresh local server returned `/health` ok.
- Browser smoke using `?smoke=hub&phase2=progression&phase4=trees` confirmed:
  - Hub rendered with canvas.
  - Skill Tree panel opened.
  - Physical Training purchase succeeded.
  - Skill points decreased.
  - Loadouts panel opened.
  - Loadout A saved.
  - Loadout A activated.
  - Hotbar slot 3 remained assigned to Hero Pulse.
  - No fatal console errors.

## Deferred To Later Phases

- Capstone active runtime effects for Earthbreaker, Elemental Nova, and Sanctuary.
- Rich visual skill tree layout.
- Choice-node exclusivity.
- Named custom loadout labels.
- Drag-and-drop hotbar editing.
