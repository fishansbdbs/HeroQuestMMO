# Phase 7 - Palace and Ice Mage

Phase 7 adds the Palace of Zero as the level 8 IceZero boss chamber and introduces Zero, the Ice Mage.

## Added

- Palace of Zero zone registry entry and Frostveil portal gate.
- Ice Mage boss balance data, loot table, and IceZero quest entries.
- Server-authoritative Ice Mage state machine with repeated phase attacks.
- Ice Mage telegraph, impact, summon, reset, and defeat world events.
- Palace entry quest credit and Ice Mage defeat quest credit.
- First-clear Icebreaker title, achievement marker, and one-time rare reward.
- Client Palace scene, Ice Mage model, boss HUD support, targeting, and local smoke-test boss loop.

## Verification Focus

- `npm test --prefix server`
- `npm run check`
- `npm run build --prefix client`
- Browser smoke: `?smoke=palace&phase7=ice_mage`
