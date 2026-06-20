import { RoomManager } from "./RoomManager.js";

export class WorldServer {
  constructor(io) {
    this.rooms = new RoomManager(io);
  }

  attach(socket) {
    this.rooms.attach(socket);
  }
}
