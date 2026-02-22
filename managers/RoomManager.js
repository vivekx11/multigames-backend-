class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map();
  }

  createRoom(hostId, roomName, password, gameType, maxPlayers, hostName) {
    const roomId = this.generateRoomId();
    const room = {
      id: roomId,
      name: roomName,
      password: password || null,
      gameType,
      maxPlayers: maxPlayers || 4,
      hostId,
      status: 'waiting',
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        isReady: true
      }],
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.addPlayerRoom(hostId, roomId);
    return room;
  }

  joinRoom(playerId, roomId, password, playerName) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, message: 'Game already started' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, message: 'Room is full' };
    }

    if (room.password && room.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    const player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false
    };

    room.players.push(player);
    this.addPlayerRoom(playerId, roomId);

    return { success: true, room, player };
  }

  leaveRoom(playerId, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false };
    }

    room.players = room.players.filter(p => p.id !== playerId);
    this.removePlayerRoom(playerId, roomId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return { success: true, roomClosed: true };
    }

    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
      return { success: true, room, newHost: room.players[0] };
    }

    return { success: true, room };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAvailableRooms(gameType) {
    const rooms = Array.from(this.rooms.values())
      .filter(room => 
        room.status === 'waiting' && 
        room.players.length < room.maxPlayers &&
        (!gameType || room.gameType === gameType)
      )
      .map(room => ({
        id: room.id,
        name: room.name,
        gameType: room.gameType,
        hasPassword: !!room.password,
        currentPlayers: room.players.length,
        maxPlayers: room.maxPlayers,
        hostName: room.players[0]?.name
      }));

    return rooms;
  }

  getPlayerRooms(playerId) {
    return this.playerRooms.get(playerId) || [];
  }

  addPlayerRoom(playerId, roomId) {
    if (!this.playerRooms.has(playerId)) {
      this.playerRooms.set(playerId, []);
    }
    this.playerRooms.get(playerId).push(roomId);
  }

  removePlayerRoom(playerId, roomId) {
    const rooms = this.playerRooms.get(playerId);
    if (rooms) {
      const filtered = rooms.filter(id => id !== roomId);
      if (filtered.length === 0) {
        this.playerRooms.delete(playerId);
      } else {
        this.playerRooms.set(playerId, filtered);
      }
    }
  }

  getRoomCount() {
    return this.rooms.size;
  }

  getTotalPlayers() {
    return this.playerRooms.size;
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

module.exports = RoomManager;
