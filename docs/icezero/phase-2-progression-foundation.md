# IceZero Phase 2 Progression Foundation

## Scope Completed

- Added shared IceZero progression math in `shared/progression.js`.
- Increased the shared XP table to support a level 15 cap.
- Added Health, Strength, Magic, and Defense attribute definitions.
- Added retroactive attribute and skill point derivation from level.
- Added mana, max mana, mana spending, and mana regeneration helpers.
- Added diminishing-return defense through `defense / (defense + 100)`.
- Added Rest Stone item data and reset logic.
- Added server-side validation for attribute spending, Rest Stone reset, and Hero Pulse ownership/mana.
- Wired migrated saves into server player state creation.
- Wired migrated progression fields into client save/load, local storage serialization, online join payloads, snapshots, HUD, and Character panel.
- Added a local smoke profile using `?smoke=hub&phase2=progression` for browser verification.

## Behavior Notes

- Existing saves are migrated through `migrateIceZeroSave` before client or server gameplay state is derived.
- The client writes a local backup under `heroquest-mmo-v1-save-backup-icezero-v2-save-migration` when migration runs.
- Hero Pulse is no longer treated as a free hotbar ability. The current client blocks use unless `hero_pulse` is in `learnedAbilities`.
- The Mage Trainer purchase path is not implemented yet; that belongs to Phase 3.
- Rest Stone resets spent attributes and skill-tree nodes while preserving level, XP, learned abilities, equipment, quests, and inventory other than the consumed stone.

## Verification

- `npm.cmd test --prefix server`
- `npm.cmd run build --prefix client`
- `npm.cmd run check`
- Fresh local server on port 3000 returned `/health` ok.
- Local Vite client on port 5173 loaded the hub smoke route.
- Browser smoke confirmed:
  - Canvas rendered.
  - Online status visible.
  - Mana HUD visible.
  - Character panel opens.
  - Attribute point display visible.
  - Rest Stone reset button visible in the Phase 2 smoke profile.
  - Sword remains parented to the right-hand anchor.
  - No fatal console errors.

## Deferred To Later Phases

- Mage Trainer and Healer NPC purchase UIs.
- Spellbook drag-and-drop hotbar.
- Full skill trees and build loadouts.
- Frostveil content, palace, Ice Mage boss, personal loot, and public events.
- Final v2.0.0 title/menu branding.
