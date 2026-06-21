export const ABILITIES = {
  auto_attack: {
    id: "auto_attack",
    name: "Auto Attack",
    key: "1",
    cooldownMs: 520,
    damageScale: 1,
    range: 3.2,
    description: "Repeated melee swings against the selected target."
  },
  slash: {
    id: "slash",
    name: "Slash",
    key: "2",
    cooldownMs: 4000,
    damageScale: 1.5,
    range: 3.2,
    description: "A committed sword strike for 150% weapon damage."
  },
  hero_pulse: {
    id: "hero_pulse",
    name: "Hero Pulse",
    key: "3",
    cooldownMs: 12000,
    radius: 5.2,
    damageScale: 0.8,
    knockback: 3.5,
    description: "A circular shockwave that damages nearby enemies."
  },
  guard: {
    id: "guard",
    name: "Guard",
    key: "4",
    cooldownMs: 10000,
    durationMs: 3000,
    damageReduction: 0.5,
    description: "Raise your guard, reducing incoming damage by 50% for 3 seconds."
  },
  potion: {
    id: "potion",
    name: "Potion",
    key: "5",
    cooldownMs: 8000,
    heal: 30,
    description: "Drink a small health potion to restore 30 health."
  },
  dash: {
    id: "dash",
    name: "Dash",
    key: "6",
    cooldownMs: 5000,
    distance: 7,
    description: "Burst forward with a short movement trail."
  }
};
