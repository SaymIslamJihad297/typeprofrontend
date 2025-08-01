import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
  progress: number;
  position: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  cpm: number;
  errors: number;
  timeElapsed: number;
}

export interface GameState {
  socket: Socket | null;
  gameState: 'home' | 'waiting' | 'countdown' | 'racing' | 'finished';
  roomCode: string;
  isHost: boolean;
  players: Player[];
  currentPlayer: Player | null;
  opponent: Player | null;
  duration: number;
  timeLeft: number;
  countdownTimer: number;
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  userInput: string;
  typedText: string;
  errors: number;
  startTime: number;
  endTime: number;
  finalStats: GameStats | null;
  opponentStats: GameStats | null;
  opponentCursor: { wordIndex: number; charIndex: number } | null;
}

interface GameActions {
  initSocket: () => void;
  createRoom: (playerName: string, duration: number) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startRace: () => void;
  updateTyping: (input: string) => void;
  resetGame: () => void;
  leaveRoom: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  socket: null,
  gameState: 'home',
  roomCode: '',
  isHost: false,
  players: [],
  currentPlayer: null,
  opponent: null,
  duration: 30,
  timeLeft: 30,
  countdownTimer: 3,
  words: [],
  currentWordIndex: 0,
  currentCharIndex: 0,
  userInput: '',
  typedText: '',
  errors: 0,
  startTime: 0,
  endTime: 0,
  finalStats: null,
  opponentStats: null,
  opponentCursor: null,

  initSocket: () => {
    const socket = io(BACKEND_URL);
    set({ socket });

    socket.on('roomCreated', ({ roomCode, player }) => {
      set({ 
        roomCode, 
        gameState: 'waiting', 
        isHost: true,
        currentPlayer: player,
        players: [player]
      });
    });

    socket.on('playerJoined', ({ players, player }) => {
      const state = get();
      if (state.currentPlayer?.id === player.id) {
        set({ 
          gameState: 'waiting',
          currentPlayer: player,
          players,
          opponent: players.find(p => p.id !== player.id) || null
        });
      } else {
        set({ 
          players,
          opponent: players.find(p => p.id !== state.currentPlayer?.id) || null
        });
      }
    });

    socket.on('gameStarting', ({ words, duration }) => {
      set({ 
        words, 
        duration,
        timeLeft: duration,
        gameState: 'countdown',
        countdownTimer: 3,
        currentWordIndex: 0,
        currentCharIndex: 0,
        userInput: '',
        typedText: '',
        errors: 0,
        finalStats: null,
        opponentStats: null
      });

      const countdown = setInterval(() => {
        const state = get();
        if (state.countdownTimer > 1) {
          set({ countdownTimer: state.countdownTimer - 1 });
        } else {
          clearInterval(countdown);
          set({ 
            gameState: 'racing',
            startTime: Date.now(),
            timeLeft: state.duration
          });
          
          const raceTimer = setInterval(() => {
            const currentState = get();
            if (currentState.timeLeft > 0 && currentState.gameState === 'racing') {
              set({ timeLeft: currentState.timeLeft - 1 });
            } else {
              clearInterval(raceTimer);
              if (currentState.gameState === 'racing') {
                const endTime = Date.now();
                const timeElapsed = (endTime - currentState.startTime) / 1000;
                const wordsTyped = currentState.typedText.split(' ').length;
                const wpm = Math.round((wordsTyped / timeElapsed) * 60);
                const accuracy = Math.round(((currentState.typedText.length - currentState.errors) / currentState.typedText.length) * 100) || 0;
                const cpm = Math.round((currentState.typedText.length / timeElapsed) * 60);
                
                const stats: GameStats = {
                  wpm,
                  accuracy,
                  cpm,
                  errors: currentState.errors,
                  timeElapsed
                };

                set({ 
                  gameState: 'finished',
                  endTime,
                  finalStats: stats
                });

                socket.emit('raceFinished', { stats });
              }
            }
          }, 1000);
        }
      }, 1000);
    });

    socket.on('opponentProgress', ({ progress, position, wpm, accuracy, cursor }) => {
      const state = get();
      if (state.opponent) {
        set({
          opponent: { ...state.opponent, progress, wpm, accuracy },
          opponentCursor: cursor
        });
      }
    });

    socket.on('raceResults', ({ playerStats, opponentStats }) => {
      set({
        finalStats: playerStats,
        opponentStats,
        gameState: 'finished'
      });
    });

    socket.on('playerLeft', () => {
      set({
        gameState: 'home',
        roomCode: '',
        isHost: false,
        players: [],
        currentPlayer: null,
        opponent: null
      });
    });
  },

  createRoom: (playerName: string, duration: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('createRoom', { playerName, duration });
    }
  },

  joinRoom: (roomCode: string, playerName: string) => {
    const { socket } = get();
    if (socket) {
      set({ roomCode });
      socket.emit('joinRoom', { roomCode, playerName });
    }
  },

  startRace: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('startRace');
    }
  },

  updateTyping: (input: string) => {
    const state = get();
    const { words, currentWordIndex, socket } = state;
    
    if (state.gameState !== 'racing') return;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Handle space key - move to next word if current word is complete
    if (input.endsWith(' ')) {
      if (input.trim() === currentWord) {
        // Word completed correctly
        const newWordIndex = currentWordIndex + 1;
        const newTypedText = state.typedText + currentWord + ' ';
        
        set({
          userInput: '',
          currentWordIndex: newWordIndex,
          currentCharIndex: 0,
          typedText: newTypedText
        });
        
        // Calculate and emit progress
        const totalChars = words.slice(0, Math.min(50, words.length)).join(' ').length;
        const currentProgress = Math.min(100, (newTypedText.length / totalChars) * 100);
        
        const timeElapsed = (Date.now() - state.startTime) / 1000;
        const wordsTyped = newTypedText.split(' ').length;
        const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
        const accuracy = newTypedText.length > 0 ? 
          Math.round(((newTypedText.length - state.errors) / newTypedText.length) * 100) : 100;

        if (socket) {
          socket.emit('updateProgress', {
            progress: currentProgress,
            position: newWordIndex,
            wpm,
            accuracy,
            cursor: { wordIndex: newWordIndex, charIndex: 0 }
          });
        }
        return;
      } else {
        // Prevent space if word is not complete
        return;
      }
    }

    // Handle regular typing
    const newCharIndex = input.length;
    let newErrors = state.errors;
    
    // Count errors for current word
    for (let i = 0; i < input.length; i++) {
      if (i < currentWord.length && input[i] !== currentWord[i]) {
        // This is simplified - in a real app you'd want more sophisticated error tracking
      }
    }
    
    set({
      userInput: input,
      currentCharIndex: newCharIndex,
      errors: newErrors
    });

    // Calculate and emit progress
    const totalChars = words.slice(0, Math.min(50, words.length)).join(' ').length;
    const currentProgress = Math.min(100, ((state.typedText.length + input.length) / totalChars) * 100);
    
    const timeElapsed = (Date.now() - state.startTime) / 1000;
    const wordsTyped = (state.typedText + input).split(' ').length;
    const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
    const accuracy = state.typedText.length + input.length > 0 ? 
      Math.round(((state.typedText.length + input.length - newErrors) / (state.typedText.length + input.length)) * 100) : 100;

    // Emit progress to opponent
    if (socket) {
      socket.emit('updateProgress', {
        progress: currentProgress,
        position: currentWordIndex,
        wpm,
        accuracy,
        cursor: { wordIndex: currentWordIndex, charIndex: newCharIndex }
      });
    }
  },

  resetGame: () => {
    set({
      gameState: 'waiting',
      countdownTimer: 3,
      words: [],
      currentWordIndex: 0,
      currentCharIndex: 0,
      userInput: '',
      typedText: '',
      errors: 0,
      startTime: 0,
      endTime: 0,
      finalStats: null,
      opponentStats: null,
      opponentCursor: null
    });
  },

  leaveRoom: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    
    set({
      socket: null,
      gameState: 'home',
      roomCode: '',
      isHost: false,
      players: [],
      currentPlayer: null,
      opponent: null,
      duration: 30,
      timeLeft: 30,
      countdownTimer: 3,
      words: [],
      currentWordIndex: 0,
      currentCharIndex: 0,
      userInput: '',
      typedText: '',
      errors: 0,
      startTime: 0,
      endTime: 0,
      finalStats: null,
      opponentStats: null,
      opponentCursor: null
    });
  }
}));