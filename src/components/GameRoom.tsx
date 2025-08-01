import React from 'react';
import { Copy, Users, Clock, Play, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

const GameRoom: React.FC = () => {
  const { 
    roomCode, 
    isHost, 
    players, 
    currentPlayer, 
    opponent, 
    duration, 
    startRace, 
    leaveRoom 
  } = useGameStore();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  const canStart = players.length === 2 && isHost;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={leaveRoom}
              className="absolute left-4 top-4 p-2 text-typing-pending hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Game Room</h1>
          </div>
          
          {/* Room Code Display */}
          <div className="bg-dark-secondary rounded-lg p-6 mb-6">
            <p className="text-typing-pending mb-2">Room Code</p>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-4xl font-mono font-bold tracking-wider text-typing-correct">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 bg-dark-accent rounded-lg hover:bg-typing-correct hover:text-dark-primary transition-all"
                title="Copy room code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-dark-secondary rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center text-typing-pending">
              <Clock className="w-5 h-5 mr-2" />
              <span>Duration: {duration}s</span>
            </div>
            <div className="flex items-center text-typing-pending">
              <Users className="w-5 h-5 mr-2" />
              <span>Players: {players.length}/2</span>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Player 1 */}
          <div className="bg-dark-secondary rounded-lg p-6 border-2 border-typing-correct">
            <div className="text-center">
              <div className="w-16 h-16 bg-typing-correct rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-dark-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {currentPlayer?.name || 'Waiting...'}
              </h3>
              <p className="text-typing-pending text-sm">
                {isHost ? 'Host' : 'Player'}
              </p>
            </div>
          </div>

          {/* Player 2 */}
          <div className={`bg-dark-secondary rounded-lg p-6 border-2 ${
            opponent ? 'border-blue-400' : 'border-dark-accent border-dashed'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                opponent ? 'bg-blue-400' : 'bg-dark-accent'
              }`}>
                <Users className={`w-8 h-8 ${
                  opponent ? 'text-dark-primary' : 'text-typing-pending'
                }`} />
              </div>
              <h3 className="font-semibold text-lg">
                {opponent?.name || 'Waiting for opponent...'}
              </h3>
              <p className="text-typing-pending text-sm">
                {opponent ? 'Player' : 'Share room code'}
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        {canStart ? (
          <button
            onClick={startRace}
            className="w-full py-4 px-6 bg-gradient-to-r from-typing-correct to-blue-400 text-dark-primary font-bold text-lg rounded-lg hover:from-green-400 hover:to-blue-500 transition-all flex items-center justify-center"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Race
          </button>
        ) : (
          <div className="text-center p-4 bg-dark-secondary rounded-lg text-typing-pending">
            {players.length < 2 
              ? 'Waiting for another player to join...'
              : !isHost 
                ? 'Waiting for host to start the race...'
                : 'Ready to start!'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom;