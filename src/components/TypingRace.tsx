import React, { useEffect, useRef, useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

const TypingRace: React.FC = () => {
  const {
    gameState,
    timeLeft,
    countdownTimer,
    words,
    currentWordIndex,
    currentCharIndex,
    userInput,
    typedText,
    currentPlayer,
    opponent,
    opponentCursor,
    updateTyping,
    leaveRoom
  } = useGameStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 });
  const [opponentCaretPosition, setOpponentCaretPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (gameState === 'racing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    updateCaretPosition();
  }, [currentWordIndex, currentCharIndex, words]);

  useEffect(() => {
    updateOpponentCaretPosition();
  }, [opponentCursor]);

  const updateCaretPosition = () => {
    if (!wordsContainerRef.current) return;
    
    const currentWordElement = wordsContainerRef.current.querySelector(`[data-word-index="${currentWordIndex}"]`);
    if (!currentWordElement) return;

    const currentCharElement = currentWordElement.querySelector(`[data-char-index="${currentCharIndex}"]`);
    if (currentCharElement) {
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const charRect = currentCharElement.getBoundingClientRect();
      
      setCaretPosition({
        top: charRect.top - containerRect.top,
        left: charRect.left - containerRect.left
      });
    } else {
      // Position at end of word
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const wordRect = currentWordElement.getBoundingClientRect();
      
      setCaretPosition({
        top: wordRect.top - containerRect.top,
        left: wordRect.right - containerRect.left + 4
      });
    }
  };

  const updateOpponentCaretPosition = () => {
    if (!wordsContainerRef.current || !opponentCursor) return;
    
    const opponentWordElement = wordsContainerRef.current.querySelector(`[data-word-index="${opponentCursor.wordIndex}"]`);
    if (!opponentWordElement) return;

    const opponentCharElement = opponentWordElement.querySelector(`[data-char-index="${opponentCursor.charIndex}"]`);
    if (opponentCharElement) {
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const charRect = opponentCharElement.getBoundingClientRect();
      
      setOpponentCaretPosition({
        top: charRect.top - containerRect.top,
        left: charRect.left - containerRect.left
      });
    } else {
      // Position at end of word
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const wordRect = opponentWordElement.getBoundingClientRect();
      
      setOpponentCaretPosition({
        top: wordRect.top - containerRect.top,
        left: wordRect.right - containerRect.left + 4
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTyping(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent default behavior for space at the beginning
    if (e.key === ' ' && userInput === '') {
      e.preventDefault();
    }
  };

  const getCharacterState = (wordIndex: number, charIndex: number) => {
    if (wordIndex < currentWordIndex) {
      // Already completed word - all correct
      return 'correct';
    } else if (wordIndex === currentWordIndex) {
      if (charIndex < userInput.length) {
        // Character has been typed
        const typedChar = userInput[charIndex];
        const expectedChar = words[wordIndex][charIndex];
        return typedChar === expectedChar ? 'correct' : 'incorrect';
      } else if (charIndex === userInput.length) {
        // Current character
        return 'current';
      } else {
        // Future character
        return 'pending';
      }
    } else {
      // Future word
      return 'pending';
    }
  };

  const renderWords = () => {
    const visibleWords = words.slice(0, Math.min(50, words.length));
    
    return visibleWords.map((word, wordIndex) => (
      <span key={wordIndex} className="word" data-word-index={wordIndex}>
        {word.split('').map((char, charIndex) => {
          const state = getCharacterState(wordIndex, charIndex);
          
          return (
            <span
              key={charIndex}
              className={`char ${state}`}
              data-char-index={charIndex}
            >
              {char}
            </span>
          );
        })}
        <span className="char space"> </span>
      </span>
    ));
  };

  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="countdown-number text-9xl font-bold text-typing-correct mb-4">
            {countdownTimer > 0 ? countdownTimer : 'GO!'}
          </div>
          <p className="text-xl text-typing-pending">Get ready to type...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={leaveRoom}
          className="p-2 text-typing-pending hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-typing-correct">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-2xl font-bold font-mono">
              {Math.max(0, timeLeft)}s
            </span>
          </div>
        </div>
      </div>

      {/* Players Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Current Player */}
        <div className="bg-dark-secondary rounded-lg p-4">
          <h3 className="font-semibold text-typing-correct mb-2">
            {currentPlayer?.name} (You)
          </h3>
          <div className="text-sm text-typing-pending space-y-1">
            <div>WPM: {currentPlayer?.wpm || 0}</div>
            <div>Accuracy: {currentPlayer?.accuracy || 100}%</div>
          </div>
        </div>

        {/* Opponent */}
        <div className="bg-dark-secondary rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">
            {opponent?.name || 'Opponent'}
          </h3>
          <div className="text-sm text-typing-pending space-y-1">
            <div>WPM: {opponent?.wpm || 0}</div>
            <div>Accuracy: {opponent?.accuracy || 100}%</div>
          </div>
        </div>
      </div>

      {/* Typing Area */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Words Container */}
          <div 
            ref={wordsContainerRef}
            className="typing-area relative text-2xl leading-relaxed p-6 bg-dark-secondary rounded-lg min-h-[200px] font-mono select-none"
            style={{ lineHeight: '2.5rem' }}
          >
            {renderWords()}
            
            {/* User Cursor */}
            <div
              className="caret user-caret"
              style={{
                position: 'absolute',
                top: `${caretPosition.top}px`,
                left: `${caretPosition.left}px`,
                width: '2px',
                height: '2.5rem',
                backgroundColor: '#4ade80',
                zIndex: 10,
                animation: 'blink 1s infinite'
              }}
            />
            
            {/* Opponent Cursor */}
            {opponentCursor && (
              <div
                className="caret opponent-caret"
                style={{
                  position: 'absolute',
                  top: `${opponentCaretPosition.top}px`,
                  left: `${opponentCaretPosition.left}px`,
                  width: '2px',
                  height: '2.5rem',
                  backgroundColor: '#3b82f6',
                  opacity: 0.7,
                  zIndex: 9,
                  animation: 'blink 1s infinite'
                }}
              />
            )}
          </div>

          {/* Hidden Input */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
            disabled={gameState !== 'racing'}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};

export default TypingRace;