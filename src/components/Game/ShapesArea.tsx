import React from 'react';
import { RotateCw, Trash2, Layers, Check, Sparkles } from 'lucide-react';
import { Shape } from '../../types';
import { sounds } from '../../utils/sound';

interface ShapesAreaProps {
  availableShapes: Shape[];
  selectedShape: Shape | null;
  onSelectShape: (shape: Shape | null) => void;
  onRotateShape: (shapeId: string) => void;
  onMoveToTrash: (shape: Shape) => void;
  onMoveToMerge: (shape: Shape) => void;
  onStartDrag?: (shape: Shape) => void;
  isAr: boolean;
}

export const ShapesArea: React.FC<ShapesAreaProps> = ({
  availableShapes,
  selectedShape,
  onSelectShape,
  onRotateShape,
  onMoveToTrash,
  onMoveToMerge,
  onStartDrag,
  isAr,
}) => {
  const handleDragStart = (e: React.DragEvent, shape: Shape) => {
    e.dataTransfer.setData('application/json', JSON.stringify(shape));
    onSelectShape(shape);
    onStartDrag?.(shape);
  };

  const handleTouchStart = (shape: Shape) => {
    onSelectShape(shape);
    onStartDrag?.(shape);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-xl px-2 mb-2">
        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#00ECE3]" />
          {isAr ? 'الأشكال العشوائية المتاحة (1 - 3):' : 'Available Shapes (1 - 3):'}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {availableShapes.length} {isAr ? 'متبقي' : 'left'}
        </span>
      </div>

      {/* Shapes Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-xl p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-900/5 min-h-[130px]">
        {availableShapes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-xs font-bold text-slate-400 dark:text-slate-500">
            <span className="animate-spin text-lg mb-1">⏳</span>
            {isAr ? 'جاري تجهيز الموجة التالية من المكعبات...' : 'Spawning next wave of cubes...'}
          </div>
        ) : (
          availableShapes.map((shape) => {
            const isSelected = selectedShape?.id === shape.id;

            return (
              <div
                key={shape.id}
                id={`shape-card-${shape.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, shape)}
                onTouchStart={() => handleTouchStart(shape)}
                onClick={() => {
                  sounds.playPlace();
                  onSelectShape(isSelected ? null : shape);
                }}
                className={`group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-950/50 ring-2 ring-[#00ECE3] shadow-lg shadow-[#00ECE3]/30 scale-105'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#00ECE3]/60 hover:scale-102'
                }`}
              >
                {/* Selected check badge */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#00ECE3] text-slate-950 flex items-center justify-center shadow-xs animate-scaleIn">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Mini Shape Preview Grid */}
                <div
                  className="grid gap-1 p-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${shape.matrix[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {shape.matrix.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}_${cIdx}`}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-all ${
                          cell === 1
                            ? 'cube-block'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                          backgroundColor: cell === 1 ? shape.color : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>

                {/* Shape Info & Action buttons */}
                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 w-full justify-between">
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 truncate max-w-[70px]">
                    {shape.name}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Rotate Button (زر التدوير) */}
                    <button
                      type="button"
                      id={`rotate-btn-${shape.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playPlace();
                        onRotateShape(shape.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center"
                      title={isAr ? 'تدوير الشكل 90 درجة 🔄' : 'Rotate Shape 90° 🔄'}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Merge Button (زر دمج بجانب زر التدوير) */}
                    <button
                      type="button"
                      id={`merge-btn-${shape.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playMerge();
                        onMoveToMerge(shape);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#00ECE3]/15 hover:bg-[#00ECE3] text-cyan-800 dark:text-[#00ECE3] hover:text-slate-950 border border-[#00ECE3]/30 text-[10px] font-black transition-all flex items-center gap-1 shadow-xs hover:scale-105 active:scale-95"
                      title={isAr ? 'نقل هذا الشكل إلى منطقة الدمج 🧩' : 'Move shape to Merge Studio 🧩'}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isAr ? 'دمج' : 'Merge'}</span>
                    </button>

                    {/* Trash Button */}
                    <button
                      type="button"
                      id={`trash-btn-${shape.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playTrash();
                        onMoveToTrash(shape);
                      }}
                      className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center"
                      title={isAr ? 'نقل إلى سلة المهملات 🗑️' : 'Move to Trash Bin 🗑️'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
