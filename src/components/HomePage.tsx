import React, { useState, useEffect } from 'react';
import { Keyboard, Users, Clock, Zap } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

const HomePage: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const { initSocket, createRoom, joinRoom } = useGameStore();

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    if (mode === 'create') {
      createRoom(playerName.trim(), duration);
    } else {
      if (!roomCode.trim()) return;
      joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Keyboard className="w-12 h-12 text-typing-correct mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-typing-correct to-blue-400 bg-clip-text text-transparent">
              TypeBattle
            </h1>
          </div>
          <p className="text-typing-pending text-lg">
            Real-time multiplayer typing races
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-dark-secondary rounded-lg p-1 mb-6">
          {(['create', 'join'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === m
                  ? 'bg-typing-correct text-dark-primary'
                  : 'text-typing-pending hover:text-white'
              }`}
            >
              {m === 'create' ? (
                <span className="flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  Create Room
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Join Room
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name */}
          <div>
            <label className="block text-sm font-medium text-typing-pending mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-dark-secondary border border-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-typing-correct text-white placeholder-typing-pending"
              required
            />
          </div>

          {/* Room Code (Join mode) */}
          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-typing-pending mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character room code"
                maxLength={6}
                className="w-full px-4 py-3 bg-dark-secondary border border-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-typing-correct text-white placeholder-typing-pending uppercase tracking-wider font-mono"
                required
              />
            </div>
          )}

          {/* Duration (Create mode) */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-typing-pending mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Race Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      duration === d
                        ? 'bg-typing-correct text-dark-primary'
                        : 'bg-dark-secondary text-typing-pending hover:text-white border border-dark-accent'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!playerName.trim() || (mode === 'join' && !roomCode.trim())}
            className="w-full py-3 px-4 bg-gradient-to-r from-typing-correct to-blue-400 text-dark-primary font-semibold rounded-lg hover:from-green-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? 'Create Room' : 'Join Race'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;