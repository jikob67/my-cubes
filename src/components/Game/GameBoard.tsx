import React, { useState, useEffect, useRef } from 'react';
import { Shape } from '../../types';
import { canPlaceShape } from '../../utils/gameLogic';
import { sounds } from '../../utils/sound';

interface GameBoardProps {
  grid: (string | null)[][];
  selectedShape: Shape | null;
  onPlaceShape: (r: number, c: number, shape: Shape) => boolean;
  gridSize: number;
  isAr: boolean;
  clearedRows?: number[];
  clearedCols?: number[];
  draggingShape?: Shape | null;
  onClearDraggingShape?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  selectedShape,
  onPlaceShape,
  gridSize,
  isAr,
  clearedRows = [],
  clearedCols = [],
  draggingShape = null,
  onClearDraggingShape,
}) => {
  const [hoverPos, setHoverPos] = useState<{ r: number; c: number } | null>(null);
  const [invalidFlashPos, setInvalidFlashPos] = useState<{ r: number; c: number } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const activeShape = draggingShape || selectedShape;

  // Touch drag support: handle touchmove on window when dragging
  useEffect(() => {
    if (!activeShape) return;

    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      if (!gridContainerRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;

      const rect = gridContainerRef.current.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        const cellWidth = rect.width / gridSize;
        const cellHeight = rect.height / gridSize;
        const col = Math.floor((clientX - rect.left) / cellWidth);
        const row = Math.floor((clientY - rect.top) / cellHeight);

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          setHoverPos({ r: row, c: col });
        }
      } else {
        setHoverPos(null);
      }
    };

    const handlePointerUp = () => {
      if (hoverPos && activeShape) {
        if (canPlaceShape(grid, gridSize, hoverPos.r, hoverPos.c, activeShape)) {
          onPlaceShape(hoverPos.r, hoverPos.c, activeShape);
          setHoverPos(null);
          onClearDraggingShape?.();
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeShape, hoverPos, grid, gridSize, onPlaceShape, onClearDraggingShape]);

  const handleCellClick = (r: number, c: number) => {
    if (!activeShape) return;

    if (canPlaceShape(grid, gridSize, r, c, activeShape)) {
      onPlaceShape(r, c, activeShape);
      setHoverPos(null);
    } else {
      sounds.playError();
      setInvalidFlashPos({ r, c });
      setTimeout(() => setInvalidFlashPos(null), 500);
    }
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    setHoverPos({ r, c });
  };

  const handleDrop = (e: React.DragEvent, r: number, c: number) => {
    e.preventDefault();
    setHoverPos(null);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const shape: Shape = JSON.parse(data);
        if (canPlaceShape(grid, gridSize, r, c, shape)) {
          onPlaceShape(r, c, shape);
        } else {
          sounds.playError();
          setInvalidFlashPos({ r, c });
          setTimeout(() => setInvalidFlashPos(null), 500);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute preview cells map
  const previewCells: Record<string, { isValid: boolean; color: string }> = {};
  if (activeShape && hoverPos) {
    const isValid = canPlaceShape(grid, gridSize, hoverPos.r, hoverPos.c, activeShape);
    const sRows = activeShape.matrix.length;
    const sCols = activeShape.matrix[0].length;

    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
        if (activeShape.matrix[r][c] === 1) {
          const targetR = hoverPos.r + r;
          const targetC = hoverPos.c + c;
          if (targetR >= 0 && targetR < gridSize && targetC >= 0 && targetC < gridSize) {
            previewCells[`${targetR}_${targetC}`] = {
              isValid,
              color: activeShape.color,
            };
          }
        }
      }
    }
  }

  // Calculate filled cells stats
  const filledCount = grid.reduce((acc, row) => acc + row.filter((c) => c !== null).length, 0);
  const totalCells = gridSize * gridSize;
  const progressPercent = Math.round((filledCount / totalCells) * 100);

  // Dynamic cell styling based on grid density
  const cellGapClass =
    gridSize <= 4
      ? 'gap-2.5 sm:gap-3.5'
      : gridSize <= 6
      ? 'gap-2 sm:gap-2.5'
      : gridSize <= 8
      ? 'gap-1.5 sm:gap-2'
      : gridSize <= 12
      ? 'gap-1 sm:gap-1.5'
      : 'gap-0.5 sm:gap-1';

  const cellRadiusClass =
    gridSize <= 4
      ? 'rounded-2xl sm:rounded-3xl'
      : gridSize <= 6
      ? 'rounded-xl sm:rounded-2xl'
      : gridSize <= 8
      ? 'rounded-lg sm:rounded-xl'
      : gridSize <= 12
      ? 'rounded-md sm:rounded-lg'
      : 'rounded-xs sm:rounded-sm';

  const boardMaxWidth =
    gridSize <= 4
      ? 'max-w-[320px] sm:max-w-[360px]'
      : gridSize <= 6
      ? 'max-w-[360px] sm:max-w-[420px]'
      : gridSize <= 8
      ? 'max-w-[400px] sm:max-w-[460px]'
      : gridSize <= 12
      ? 'max-w-[440px] sm:max-w-[500px]'
      : 'max-w-[480px] sm:max-w-[540px]';

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Grid Container */}
      <div
        id="main-game-grid"
        ref={gridContainerRef}
        className={`relative w-full ${boardMaxWidth} p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-cyan-900/10 dark:shadow-black/50 backdrop-blur-md transition-all touch-none`}
        onMouseLeave={() => setHoverPos(null)}
      >
        <div
          className={`grid w-full aspect-square ${cellGapClass} select-none`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cellColor, c) => {
              const cellKey = `${r}_${c}`;
              const preview = previewCells[cellKey];
              const isInvalidFlash =
                invalidFlashPos && invalidFlashPos.r === r && invalidFlashPos.c === c;
              const isLineClearing = clearedRows.includes(r) || clearedCols.includes(c);

              return (
                <div
                  key={cellKey}
                  id={`cell-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => activeShape && setHoverPos({ r, c })}
                  onDragOver={(e) => handleDragOver(e, r, c)}
                  onDrop={(e) => handleDrop(e, r, c)}
                  className={`relative aspect-square ${cellRadiusClass} transition-all duration-150 cursor-pointer flex items-center justify-center ${
                    isLineClearing
                      ? 'animate-ping scale-110 ring-4 ring-[#00ECE3] bg-cyan-300'
                      : cellColor
                      ? 'cube-block shadow-md'
                      : preview
                      ? preview.isValid
                        ? 'opacity-85 scale-95 ring-2 ring-[#00ECE3] shadow-md shadow-[#00ECE3]/40'
                        : 'bg-rose-500/40 ring-2 ring-rose-500 animate-shake'
                      : isInvalidFlash
                      ? 'bg-rose-500/60 ring-2 ring-rose-500 scale-95'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#00ECE3]/60 hover:bg-[#00ECE3]/5'
                  }`}
                  style={{
                    backgroundColor: isLineClearing
                      ? '#00ECE3'
                      : cellColor || (preview && preview.isValid ? preview.color : undefined),
                  }}
                >
                  {/* Subtle inner grid coordinate dot */}
                  {!cellColor && !preview && !isLineClearing && gridSize <= 10 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60"></span>
                  )}

                  {/* 3D Highlight on filled cubes */}
                  {cellColor && !isLineClearing && (
                    <div className={`absolute inset-0 ${cellRadiusClass} pointer-events-none border-t-2 border-l-2 border-white/60 shadow-inner`}></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Shape Placement Hint */}
      {activeShape && (
        <div className="mt-3 px-4 py-1.5 rounded-full bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3] border border-[#00ECE3]/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#00ECE3] animate-pulse"></span>
          <span>
            {isAr
              ? `الشكل المحدد: ${activeShape.name} (${activeShape.cubesCount} مكعبات) — اضغط أو اسحب للموضع الصالح!`
              : `Selected: ${activeShape.name} (${activeShape.cubesCount} cubes) — Tap or drag to place!`}
          </span>
        </div>
      )}
    </div>
  );
};
