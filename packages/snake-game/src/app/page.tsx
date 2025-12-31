'use client';

import { useEffect, useState, useCallback } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type FoodType = 'cap' | 'snowman';

interface Food {
  position: Position;
  type: FoodType;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Food | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generateFood = useCallback((): Food => {
    const type: FoodType = Math.random() > 0.7 ? 'snowman' : 'cap';
    let newFood: Position;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return { position: newFood, type };
  }, [snake]);

  useEffect(() => {
    if (!food) {
      setFood(generateFood());
    }
  }, [food, generateFood]);

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (direction) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (food && newHead.x === food.position.x && newHead.y === food.position.y) {
        const points = food.type === 'snowman' ? 10 : 5;
        const growth = food.type === 'snowman' ? 2 : 1;
        
        setScore(prev => prev + points);
        setFood(null);
        
        // Add extra segments for growth
        for (let i = 1; i < growth; i++) {
          newSnake.push(prevSnake[prevSnake.length - 1]);
        }
        
        return newSnake;
      }

      // Remove tail if no food eaten
      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(null);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white mb-2">🎄 Christmas Snake 🎄</h1>
        <div className="text-2xl text-white font-semibold">Score: {score}</div>
        <div className="text-sm text-blue-200 mt-2">
          🎅 Christmas Cap = 5 points | ⛄ Snowman = 10 points
        </div>
      </div>

      <div 
        className="relative bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl border-4 border-white/20"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE 
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${index === 0 ? 'bg-green-400' : 'bg-green-500'} rounded-sm border border-green-600`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        ))}

        {/* Food */}
        {food && (
          <div
            className="absolute flex items-center justify-center text-2xl"
            style={{
              left: food.position.x * CELL_SIZE,
              top: food.position.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            {food.type === 'cap' ? '🎅' : '⛄'}
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
            <div className="text-white text-4xl font-bold mb-4">Game Over!</div>
            <div className="text-white text-2xl mb-6">Final Score: {score}</div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white text-xl font-semibold animate-pulse">
              Press any arrow key to start
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-white/80 text-sm">
        Use arrow keys to control the snake
      </div>
    </div>
  );
}

