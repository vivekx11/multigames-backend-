class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map();
  }

  initializeGame(roomId, gameType, players) {
    const game = {
      roomId,
      gameType,
      players: players.map((p, index) => ({
        id: p.id,
        name: p.name,
        position: 0,
        score: 0,
        order: index
      })),
      currentTurn: 0,
      state: this.getInitialGameState(gameType, players.length),
      startedAt: Date.now()
    };

    this.games.set(roomId, game);
    return game;
  }

  getInitialGameState(gameType, playerCount) {
    switch (gameType) {
      case 'ludo':
        return {
          board: this.initializeLudoBoard(playerCount),
          dice: null
        };
      case 'snake_ladder':
        return {
          board: this.initializeSnakeLadderBoard(),
          dice: null
        };
      case 'business':
        return {
          properties: this.initializeBusinessProperties(),
          money: Array(playerCount).fill(1500)
        };
      case 'bingo':
        return {
          cards: this.generateBingoCards(playerCount),
          calledNumbers: []
        };
      default:
        return {};
    }
  }

  processMove(roomId, playerId, move) {
    const game = this.games.get(roomId);
    if (!game) return null;

    const currentPlayer = game.players[game.currentTurn];
    if (currentPlayer.id !== playerId) {
      return { error: 'Not your turn' };
    }

    let result = {};

    switch (game.gameType) {
      case 'ludo':
        result = this.processLudoMove(game, move);
        break;
      case 'snake_ladder':
        result = this.processSnakeLadderMove(game, move);
        break;
      case 'business':
        result = this.processBusinessMove(game, move);
        break;
      case 'bingo':
        result = this.processBingoMove(game, move);
        break;
    }

    if (!result.skipTurn) {
      game.currentTurn = (game.currentTurn + 1) % game.players.length;
    }

    return {
      gameState: game.state,
      players: game.players,
      currentTurn: game.currentTurn,
      move: result
    };
  }

  processLudoMove(game, move) {
    const { dice } = move;
    game.state.dice = dice || Math.floor(Math.random() * 6) + 1;
    return { dice: game.state.dice, skipTurn: game.state.dice === 6 };
  }

  processSnakeLadderMove(game, move) {
    const { dice } = move;
    const diceRoll = dice || Math.floor(Math.random() * 6) + 1;
    game.state.dice = diceRoll;
    
    const player = game.players[game.currentTurn];
    player.position += diceRoll;

    if (player.position > 100) {
      player.position -= diceRoll;
    }

    const snakesLadders = this.getSnakesAndLadders();
    if (snakesLadders[player.position]) {
      player.position = snakesLadders[player.position];
    }

    return { dice: diceRoll, newPosition: player.position };
  }

  processBusinessMove(game, move) {
    return { action: move.action };
  }

  processBingoMove(game, move) {
    const { number } = move;
    if (!game.state.calledNumbers.includes(number)) {
      game.state.calledNumbers.push(number);
    }
    return { calledNumber: number };
  }

  initializeLudoBoard(playerCount) {
    return { pieces: Array(playerCount).fill(null).map(() => [0, 0, 0, 0]) };
  }

  initializeSnakeLadderBoard() {
    return { positions: [] };
  }

  initializeBusinessProperties() {
    return [];
  }

  generateBingoCards(playerCount) {
    return Array(playerCount).fill(null).map(() => 
      this.generateBingoCard()
    );
  }

  generateBingoCard() {
    const card = [];
    for (let i = 0; i < 5; i++) {
      const column = [];
      const min = i * 15 + 1;
      const max = min + 14;
      const numbers = [];
      
      while (numbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
      card.push(numbers);
    }
    return card;
  }

  getSnakesAndLadders() {
    return {
      4: 14, 9: 31, 17: 7, 20: 38, 28: 84, 40: 59, 51: 67, 54: 34,
      62: 19, 63: 81, 64: 60, 71: 91, 87: 24, 93: 73, 95: 75, 99: 78
    };
  }

  endGame(roomId) {
    this.games.delete(roomId);
  }
}

module.exports = GameManager;
