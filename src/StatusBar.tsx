import clsx from "clsx";
import React from "react";

type StatusBarProps = {
  rockCount: number;
  paperCount: number;
  scissorsCount: number;
};

const StatusBar: React.FC<StatusBarProps> = ({
  rockCount,
  paperCount,
  scissorsCount,
}) => {
  // Create a sorted list of piece counts
  const pieceCounts = [
    { type: "rock", count: rockCount },
    { type: "paper", count: paperCount },
    { type: "scissors", count: scissorsCount },
  ].sort((a, b) => b.count - a.count); // Sort by count in descending order

  return (
    <div className="absolute top-4 right-4 bg-gray-800/90 p-4 rounded-lg shadow-lg text-sm z-20">
      {pieceCounts.map(({ type, count }) => (
        <div
          key={type}
          className={clsx(
            "flex items-center space-x-2",
            count === 0
              ? "line-through text-red-500"
              : count > 10
              ? "text-blue-500"
              : count >= 5
              ? "text-green-500"
              : count >= 2
              ? "text-yellow-500"
              : "text-red-500"
          )}
        >
          <span className="capitalize">{type}:</span>
          <span>{count}</span>
        </div>
      ))}
    </div>
  );
};

export default StatusBar;
