import { PLAYER_LIMITS } from "../../shared/constants.js";

export class PartySystem {
  constructor(codeFactory = randomCode) {
    this.parties = new Map();
    this.playerParty = new Map();
    this.codeFactory = codeFactory;
  }

  createParty(playerId) {
    this.leaveParty(playerId);
    let code = "";
    for (let i = 0; i < 8; i += 1) {
      code = this.codeFactory().toUpperCase();
      if (!this.parties.has(code)) break;
    }
    const party = { code, leaderId: playerId, members: [playerId], createdAt: Date.now() };
    this.parties.set(code, party);
    this.playerParty.set(playerId, code);
    return { ...party };
  }

  joinParty(playerId, code) {
    const party = this.parties.get(String(code || "").toUpperCase());
    if (!party) throw new Error("Party code not found.");
    if (party.members.length >= PLAYER_LIMITS.partySize) throw new Error("Party is full.");
    this.leaveParty(playerId);
    if (!party.members.includes(playerId)) party.members.push(playerId);
    this.playerParty.set(playerId, party.code);
    return { ...party, members: [...party.members] };
  }

  leaveParty(playerId) {
    const code = this.playerParty.get(playerId);
    if (!code) return;
    const party = this.parties.get(code);
    this.playerParty.delete(playerId);
    if (!party) return;
    party.members = party.members.filter((id) => id !== playerId);
    if (party.members.length === 0) {
      this.parties.delete(code);
      return;
    }
    if (party.leaderId === playerId) party.leaderId = party.members[0];
  }

  getPartyForPlayer(playerId) {
    const code = this.playerParty.get(playerId);
    if (!code) return null;
    const party = this.parties.get(code);
    return party ? { ...party, members: [...party.members] } : null;
  }

  snapshot() {
    return [...this.parties.values()].map((party) => ({ ...party, members: [...party.members] }));
  }
}

function randomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}
