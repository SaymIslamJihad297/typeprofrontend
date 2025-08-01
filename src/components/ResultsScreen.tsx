import React from 'react';
import { Trophy, RotateCcw, Home, Clock, Target, Zap, AlertCircle } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

const ResultsScreen: React.FC = () => {
  const { 
    finalStats, 
    opponentStats, 
    currentPlayer, 
    opponent, 
    resetGame, 
    leaveRoom 
  } = useGameStore();

  const isWinner = finalStats && opponentStats && 
    (finalStats.wpm > opponentStats.wpm || 
     (finalStats.wpm === opponentStats.wpm && finalStats.accuracy > opponentStats.accuracy));

  const StatCard: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value: string | number; 
    color: string;
  }> = ({ icon, label, value, color }) => (
    <div className="bg-dark-secondary rounded-lg p-4">
      <div className={`flex items-center mb-2 ${color}`}>
        {icon}
        <span className="ml-2 text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className={`w-16 h-16 mr-4 ${
              isWinner ? 'text-yellow-400' : 'text-typing-pending'
            }`} />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {isWinner ? 'Victory!' : 'Race Complete!'}
              </h1>
              <p className="text-typing-pending text-lg">
                {isWinner ? 'Congratulations on your win!' : 'Good race, better luck next time!'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Your Stats */}
          <div className="bg-dark-secondary rounded-lg p-6 border-2 border-typing-correct">
            <h2 className="text-xl font-bold text-typing-correct mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              {currentPlayer?.name} (You)
              {isWinner && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-dark-primary text-xs rounded-full font-bold">
                  WINNER
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label="WPM"
                value={finalStats?.wpm || 0}
                color="text-typing-correct"
              />
              <StatCard
                icon={<Target className="w-4 h-4" />}
                label="Accuracy"
                value={`${finalStats?.accuracy || 0}%`}
                color="text-blue-400"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="CPM"
                value={finalStats?.cpm || 0}
                color="text-purple-400"
              />
              <StatCard
                icon={<AlertCircle className="w-4 h-4" />}
                label="Errors"
                value={finalStats?.errors || 0}
                color="text-typing-incorrect"
              />
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-dark-secondary rounded-lg p-6 border-2 border-blue-400">
            <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              {opponent?.name || 'Opponent'}
              {!isWinner && opponentStats && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-dark-primary text-xs rounded-full font-bold">
                  WINNER
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label="WPM"
                value={opponentStats?.wpm || 0}
                color="text-typing-correct"
              />
              <StatCard
                icon={<Target className="w-4 h-4" />}
                label="Accuracy"
                value={`${opponentStats?.accuracy || 0}%`}
                color="text-blue-400"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="CPM"
                value={opponentStats?.cpm || 0}
                color="text-purple-400"
              />
              <StatCard
                icon={<AlertCircle className="w-4 h-4" />}
                label="Errors"
                value={opponentStats?.errors || 0}
                color="text-typing-incorrect"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-typing-correct to-blue-400 text-dark-primary font-semibold rounded-lg hover:from-green-400 hover:to-blue-500 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Race Again
          </button>
          
          <button
            onClick={leaveRoom}
            className="px-8 py-3 bg-dark-accent text-white font-semibold rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;