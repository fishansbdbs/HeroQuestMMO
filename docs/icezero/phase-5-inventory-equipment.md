# IceZero Phase 5 Inventory and Equipment

## Scope Completed

- Added a shared 36-slot inventory model with stack limits for consumables, materials, and special items.
- Added shared equipment slots for:
  - Head
  - Chest
  - Hands
  - Legs
  - Boots
  - Weapon
  - Offhand
  - Accessory
- Added shared equipment validation for ownership, slot compatibility, and item level requirements.
- Added IceZero equipment metadata for staves, helmets, chest pieces, gloves, leggings, boots, shields, and materials.
- Updated stat calculation so structured equipment contributes health, attack, defense, speed, and magic power.
- Updated save migration so legacy `equippedWeapon` and `equippedArmor` populate the new structured equipment state.
- Updated loadouts so all equipment slots are preserved on save and activation.
- Added server handling for authoritative item equip requests.
- Updated loot and chest claims so inventory capacity is checked before deleting loot bags, opening chests, spending shop coins, or adding rewards.
- Updated the Inventory panel with a compact equipment summary, fixed 36-slot grid, search, and item type filter.
- Updated hero visuals to reflect structured equipment, including staff presentation and slot tinting.

## Verification

- `npm.cmd test --prefix server`
- `npm.cmd run check`

## Deferred To Later Phases

- Drag-and-drop inventory rearranging.
- Item comparison overlays.
- Upgrade, crafting, enchanting, and dismantling flows.
- Rarity-specific particle effects for equipped gear.
- Dedicated bank or stash storage.
