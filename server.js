require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const RoomManager = require('./managers/RoomManager');
const GameManager = require('./managers/GameManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();
const gameManager = new GameManager(io);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    rooms: roomManager.getRoomCount(),
    players: roomManager.getTotalPlayers()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create room
  socket.on('create_room', (data) => {
    const { roomName, password, gameType, maxPlayers, hostName } = data;
    const room = roomManager.createRoom(socket.id, roomName, password, gameType, maxPlayers, hostName);
    
    if (room) {
      socket.join(room.id);
      socket.emit('room_created', room);
      console.log(`Room created: ${room.id} by ${hostName}`);
    } else {
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join room
  socket.on('join_room', (data) => {
    const { roomId, password, playerName } = data;
    const result = roomManager.joinRoom(socket.id, roomId, password, playerName);
    
    if (result.success) {
      socket.join(roomId);
      socket.emit('room_joined', result.room);
      io.to(roomId).emit('player_joined', {
        player: result.player,
        players: result.room.players
      });
      console.log(`${playerName} joined room: ${roomId}`);
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  // Get available rooms
  socket.on('get_rooms', (gameType) => {
    const rooms = roomManager.getAvailableRooms(gameType);
    socket.emit('rooms_list', rooms);
  });

  // Leave room
  socket.on('leave_room', (roomId) => {
    const result = roomManager.leaveRoom(socket.id, roomId);
    if (result.success) {
      socket.leave(roomId);
      io.to(roomId).emit('player_left', {
        playerId: socket.id,
        players: result.room?.players || []
      });
      
      if (result.roomClosed) {
        io.to(roomId).emit('room_closed');
      } else if (result.newHost) {
        io.to(roomId).emit('host_changed', result.newHost);
      }
    }
  });

  // Start game
  socket.on('start_game', (roomId) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.hostId === socket.id && room.players.length >= 2) {
      room.status = 'playing';
      io.to(roomId).emit('game_started', {
        gameType: room.gameType,
        players: room.players
      });
      gameManager.initializeGame(roomId, room.gameType, room.players);
    } else {
      socket.emit('error', { message: 'Cannot start game' });
    }
  });

  // Game move
  socket.on('game_move', (data) => {
    const { roomId, move } = data;
    const result = gameManager.processMove(roomId, socket.id, move);
    if (result) {
      io.to(roomId).emit('game_update', result);
    }
  });

  // Chat message
  socket.on('chat_message', (data) => {
    const { roomId, message } = data;
    const room = roomManager.getRoom(roomId);
    if (room) {
      const player = room.players.find(p => p.id === socket.id);
      io.to(roomId).emit('chat_message', {
        playerId: socket.id,
        playerName: player?.name || 'Unknown',
        message,
        timestamp: Date.now()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const rooms = roomManager.getPlayerRooms(socket.id);
    rooms.forEach(roomId => {
      const result = roomManager.leaveRoom(socket.id, roomId);
      if (result.success) {
        io.to(roomId).emit('player_left', {
          playerId: socket.id,
          players: result.room?.players || []
        });
        
        if (result.roomClosed) {
          io.to(roomId).emit('room_closed');
        } else if (result.newHost) {
          io.to(roomId).emit('host_changed', result.newHost);
        }
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
