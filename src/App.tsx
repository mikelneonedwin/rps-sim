import React, { useEffect, useRef, useState } from "react";
import { Egg, FileText, Scissors } from "lucide-react";
import StatusBar from "./StatusBar";

// Constants
const MAX_VELOCITY = 2;
const COLLISION_DISTANCE = 20;
const DETECTION_RADIUS = 100;
const NUM_PIECES = 30;
const PIECE_SIZE = 24; // Each piece is 24px in size

// Types
type PieceType = "rock" | "paper" | "scissors";
type Piece = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: PieceType;
};

// Helper functions
const getRandomPosition = (canvasWidth: number, canvasHeight: number) => ({
  x: Math.random() * (canvasWidth - PIECE_SIZE),
  y: Math.random() * (canvasHeight - PIECE_SIZE),
});
const getRandomVelocity = () => ({
  vx: (Math.random() - 0.5) * MAX_VELOCITY,
  vy: (Math.random() - 0.5) * MAX_VELOCITY,
});
const getRandomType = (): PieceType => {
  const types: PieceType[] = ["rock", "paper", "scissors"];
  return types[Math.floor(Math.random() * types.length)];
};
const distance = (a: Piece, b: Piece) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

// Simulation Component
const App: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
  const animationFrameRef = useRef<number>();

  // Initialize pieces
  useEffect(() => {
    const initialPieces = Array.from({ length: NUM_PIECES }, (_, i) => ({
      id: i,
      ...getRandomPosition(canvasWidth, canvasHeight),
      ...getRandomVelocity(),
      type: getRandomType(),
    }));
    setPieces(initialPieces);
  }, [canvasWidth, canvasHeight]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
      setPieces((prevPieces) =>
        prevPieces.map((piece) => ({
          ...piece,
          x: Math.min(window.innerWidth - PIECE_SIZE, piece.x),
          y: Math.min(window.innerHeight - PIECE_SIZE, piece.y),
        }))
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update simulation
  useEffect(() => {
    const updatePieces = () => {
      setPieces((prevPieces) => {
        const newPieces = prevPieces.map((piece) => {
          // Update position
          let newX = piece.x + piece.vx;
          let newY = piece.y + piece.vy;

          // Bounce off walls and clamp to viewport (accounting for 24px size)
          if (newX < 0 || newX > canvasWidth - PIECE_SIZE) {
            piece.vx *= -1;
            newX = Math.max(0, Math.min(canvasWidth - PIECE_SIZE, newX));
          }
          if (newY < 0 || newY > canvasHeight - PIECE_SIZE) {
            piece.vy *= -1;
            newY = Math.max(0, Math.min(canvasHeight - PIECE_SIZE, newY));
          }

          // Chase prey and avoid predators
          prevPieces.forEach((other) => {
            if (piece.id === other.id) return;
            const dist = distance(piece, other);
            if (dist < DETECTION_RADIUS) {
              if (
                (piece.type === "rock" && other.type === "scissors") ||
                (piece.type === "paper" && other.type === "rock") ||
                (piece.type === "scissors" && other.type === "paper")
              ) {
                // Chase prey
                piece.vx += (other.x - piece.x) * 0.01;
                piece.vy += (other.y - piece.y) * 0.01;
              } else if (
                (piece.type === "scissors" && other.type === "rock") ||
                (piece.type === "rock" && other.type === "paper") ||
                (piece.type === "paper" && other.type === "scissors")
              ) {
                // Avoid predator
                piece.vx += (piece.x - other.x) * 0.01;
                piece.vy += (piece.y - other.y) * 0.01;
              }
            }
          });

          // Clamp velocity
          piece.vx = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, piece.vx));
          piece.vy = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, piece.vy));

          return { ...piece, x: newX, y: newY };
        });

        // Check for collisions
        newPieces.forEach((piece) => {
          newPieces.forEach((other) => {
            if (piece.id === other.id) return;
            if (distance(piece, other) < COLLISION_DISTANCE) {
              if (
                (piece.type === "rock" && other.type === "scissors") ||
                (piece.type === "paper" && other.type === "rock") ||
                (piece.type === "scissors" && other.type === "paper")
              ) {
                other.type = piece.type;
              }
            }
          });
        });

        // Check if simulation is complete
        const types = new Set(newPieces.map((p) => p.type));
        if (types.size === 1) {
          setSimulationComplete(true);
          return newPieces;
        }

        return newPieces;
      });

      if (!simulationComplete) {
        animationFrameRef.current = requestAnimationFrame(updatePieces);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updatePieces);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulationComplete, canvasWidth, canvasHeight]);

  // Count the number of pieces for each type
  const rockCount = pieces.filter((p) => p.type === "rock").length;
  const paperCount = pieces.filter((p) => p.type === "paper").length;
  const scissorsCount = pieces.filter((p) => p.type === "scissors").length;

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      <StatusBar
        rockCount={rockCount}
        paperCount={paperCount}
        scissorsCount={scissorsCount}
      />
      {pieces.map((piece) => {
        const Icon =
          piece.type === "rock"
            ? Egg
            : piece.type === "paper"
            ? FileText
            : Scissors;
        return (
          <Icon
            key={piece.id}
            data-type={piece.type}
            className="absolute transition-all duration-100"
            style={{ left: piece.x, top: piece.y }}
          />
        );
      })}
      {simulationComplete && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold bg-gray-900/90">
          Simulation Complete!
        </div>
      )}
    </div>
  );
};

export default App;
