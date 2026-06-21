# IceZero Phase 3 Trainers and Spellbook

## Scope Completed

- Added data-driven trainable ability metadata for:
  - Hero Pulse
  - Ground Pound
  - Fireball
  - Dark Punch
  - Water Blast
  - Healing Orb
  - Mend Ally
- Added Mage Trainer and Healer trainer registries.
- Added shared validation for:
  - Ability purchase requirements
  - Duplicate purchase prevention
  - Coin spending
  - Level requirements
  - Attribute requirements
  - Friendly vs hostile target rules
  - Hotbar assignment ownership checks
- Added server Socket.IO handlers for ability purchases and hotbar assignment.
- Added Dawnrest Mage Trainer and Healer NPCs near the spawn area.
- Added trainer panels for Arcanist Mira and Sister Elara.
- Added a Spellbook panel opened with `K`.
- Added Hero Pulse assignment from Spellbook to hotbar slot 3.
- Updated hotbar slot 3 so it is empty until Hero Pulse is learned and assigned.

## Verification

- `npm.cmd run check`
- Fresh local server returned `/health` ok.
- Browser smoke using `?smoke=hub&phase2=progression&phase3=trainers` confirmed:
  - Hub rendered with canvas.
  - Mage Trainer dialogue opened with `E`.
  - Mage Trainer panel opened.
  - Hero Pulse purchase succeeded.
  - Spellbook opened.
  - Hero Pulse assigned to hotbar slot 3.
  - Slot 3 became enabled and showed Hero Pulse.
  - No fatal console errors.

## Deferred To Later Phases

- Full drag-and-drop hotbar behavior.
- Active runtime implementations for Ground Pound, Fireball, Dark Punch, Water Blast, Healing Orb, and Mend Ally.
- Friendly player click targeting and party-frame target selection.
- Healer ability runtime effects and two-client healing smoke tests.
- Skill tree and loadout integration.
