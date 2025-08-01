import React from 'react';
import { useGameStore } from './hooks/useGameStore';
import HomePage from './components/HomePage';
import GameRoom from './components/GameRoom';
import TypingRace from './components/TypingRace';
import ResultsScreen from './components/ResultsScreen';

function App() {
  const { gameState } = useGameStore();

  const renderScreen = () => {
    switch (gameState) {
      case 'home':
        return <HomePage />;
      case 'waiting':
        return <GameRoom />;
      case 'countdown':
      case 'racing':
        return <TypingRace />;
      case 'finished':
        return <ResultsScreen />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {renderScreen()}
    </div>
  );
}

export default App;