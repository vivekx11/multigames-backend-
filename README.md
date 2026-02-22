# Multi-Games Backend Server

Real-time multiplayer game server using Node.js, Express, and Socket.IO.

## Features

- Room creation with password protection
- Real-time multiplayer gameplay
- In-game chat
- Support for multiple game types (Ludo, Snake & Ladder, Business, Bingo)
- Automatic host migration
- Player disconnect handling

## Setup

### Local Development

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start server:
```bash
npm run dev
```

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables:
   - `PORT`: 3000 (or leave default)
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: * (or your Flutter app domain)

## API Endpoints

### HTTP
- `GET /` - Health check and server stats

### Socket.IO Events

#### Client → Server
- `create_room` - Create a new game room
- `join_room` - Join existing room
- `get_rooms` - Get list of available rooms
- `leave_room` - Leave current room
- `start_game` - Start the game (host only)
- `game_move` - Send game move
- `chat_message` - Send chat message

#### Server → Client
- `room_created` - Room created successfully
- `room_joined` - Joined room successfully
- `rooms_list` - List of available rooms
- `player_joined` - New player joined
- `player_left` - Player left room
- `host_changed` - New host assigned
- `room_closed` - Room closed
- `game_started` - Game started
- `game_update` - Game state update
- `chat_message` - New chat message
- `error` - Error message

## Room Data Structure

```javascript
{
  id: "ABC123",
  name: "My Game Room",
  password: "secret",
  gameType: "ludo",
  maxPlayers: 4,
  hostId: "socket-id",
  status: "waiting", // or "playing"
  players: [
    {
      id: "socket-id",
      name: "Player 1",
      isHost: true,
      isReady: true
    }
  ]
}
```
