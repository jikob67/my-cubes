import { Shape } from '../types';

export interface LineClearResult {
  clearedRows: number[];
  clearedCols: number[];
  newGrid: (string | null)[][];
  linesClearedCount: number;
  pointsEarned: number;
  heartsEarned: number;
  comboBonus: number;
}

/**
 * Checks if a shape can be placed at (startR, startC) in the given grid.
 */
export function canPlaceShape(
  grid: (string | null)[][],
  gridSize: number,
  startR: number,
  startC: number,
  shape: Shape
): boolean {
  const sRows = shape.matrix.length;
  const sCols = shape.matrix[0].length;

  for (let r = 0; r < sRows; r++) {
    for (let c = 0; c < sCols; c++) {
      if (shape.matrix[r][c] === 1) {
        const targetR = startR + r;
        const targetC = startC + c;

        // Out of bounds check
        if (targetR < 0 || targetR >= gridSize || targetC < 0 || targetC >= gridSize) {
          return false;
        }

        // Cell occupied check
        if (grid[targetR][targetC] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Checks if ANY shape in the list can be placed ANYWHERE on the grid.
 */
export function hasAnyValidMove(
  grid: (string | null)[][],
  gridSize: number,
  shapes: Shape[]
): boolean {
  if (shapes.length === 0) return true;

  for (const shape of shapes) {
    const sRows = shape.matrix.length;
    const sCols = shape.matrix[0].length;

    for (let r = 0; r <= gridSize - sRows; r++) {
      for (let c = 0; c <= gridSize - sCols; c++) {
        if (canPlaceShape(grid, gridSize, r, c, shape)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Checks for completed full rows and full columns, clears them, and awards points.
 */
export function checkAndClearLines(
  grid: (string | null)[][],
  gridSize: number,
  currentStreak: number = 0
): LineClearResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // Check full rows
  for (let r = 0; r < gridSize; r++) {
    const isRowFull = grid[r].every((cell) => cell !== null);
    if (isRowFull) {
      clearedRows.push(r);
    }
  }

  // Check full columns
  for (let c = 0; c < gridSize; c++) {
    let isColFull = true;
    for (let r = 0; r < gridSize; r++) {
      if (grid[r][c] === null) {
        isColFull = false;
        break;
      }
    }
    if (isColFull) {
      clearedCols.push(c);
    }
  }

  const totalLines = clearedRows.length + clearedCols.length;
  if (totalLines === 0) {
    return {
      clearedRows: [],
      clearedCols: [],
      newGrid: grid,
      linesClearedCount: 0,
      pointsEarned: 0,
      heartsEarned: 0,
      comboBonus: 0,
    };
  }

  // Create clean grid with cleared lines removed
  const newGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (clearedRows.includes(r) || clearedCols.includes(c)) {
        return null;
      }
      return cell;
    })
  );

  // Scoring calculation:
  // Base 100 points per line
  // Multiplier for multi-line clears (e.g., 2 lines = x2.5, 3 lines = x4)
  const lineMultiplier = totalLines >= 3 ? 3.5 : totalLines === 2 ? 2.2 : 1.0;
  const streakBonus = currentStreak * 50;
  const pointsEarned = Math.round(totalLines * 100 * lineMultiplier + streakBonus);
  const heartsEarned = totalLines * 5 + (totalLines > 1 ? 10 : 0);
  const comboBonus = totalLines > 1 ? totalLines : 1;

  return {
    clearedRows,
    clearedCols,
    newGrid,
    linesClearedCount: totalLines,
    pointsEarned,
    heartsEarned,
    comboBonus,
  };
}
