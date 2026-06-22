# Phase 8 - Meta Systems

IceZero Phase 8 adds lightweight saved meta progression without changing the combat loop or rebuilding existing systems.

## Included

- Shared bestiary progress for discovered enemies, kill counts, elite kills, zone, family, and level.
- Shared achievement and title registry for First Spell, Field Medic, Wyrm Slayer, Icebreaker, Elite Hunter, and Frostveil Explorer.
- Zone completion summaries for quests, bestiary entries, bosses, waypoints, and treasure chests.
- Server integration for enemy defeats, boss first clears, zone entry, and chest opening.
- Client panels for Bestiary, Achievements, and Zone Completion.
- Local solo progression refreshes for kills, boss clears, zone entry, and treasure chests.
- Quest breadcrumb prompts for trainers, portals, ward objectives, the palace gate, and the Ice Mage chamber.

## Notes

- Existing saves already carry the Phase 8 fields through the IceZero migration: `bestiaryProgress`, `zoneCompletion`, `waypoints`, `achievements`, and `firstClearRewards`.
- The server keeps authoritative online updates through sanitized player snapshots and action acknowledgements.
- Phase 8 intentionally keeps visuals compact and reuses current HUD panel styles. Phase 9 can polish branding, title presentation, and broader UI treatment.
