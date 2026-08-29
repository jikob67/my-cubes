import React from 'react';
import { Trash2, RotateCcw, X, AlertCircle } from 'lucide-react';
import { Shape } from '../../types';
import { sounds } from '../../utils/sound';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashShapes: Shape[];
  onRestoreShape: (shape: Shape) => void;
  onEmptyTrash: () => void;
  isAr: boolean;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  trashShapes,
  onRestoreShape,
  onEmptyTrash,
  isAr,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        id="trash-modal-container"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {isAr ? 'سلة المهملات 🗑️' : 'Trash Bin 🗑️'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'الأشكال المحذوفة مؤقتاً (يمكنك استعادتها)' : 'Temporarily discarded shapes (restorable)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="py-4 max-h-[320px] overflow-y-auto">
          {trashShapes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
              <Trash2 className="w-10 h-10 stroke-1 mb-2 opacity-40" />
              <p className="text-xs font-semibold">
                {isAr ? 'سلة المهملات فارغة حالياً' : 'Trash Bin is currently empty'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAr ? 'يمكنك نقل أي شكل لا ترغب به إلى السلة والرجوع إليه لاحقاً' : 'You can discard shapes here and restore them anytime'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trashShapes.map((shape) => (
                <div
                  key={shape.id}
                  className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 relative group"
                >
                  {/* Shape Preview */}
                  <div
                    className="grid gap-0.5 p-1 mb-2"
                    style={{
                      gridTemplateColumns: `repeat(${shape.matrix[0].length}, minmax(0, 1fr))`,
                    }}
                  >
                    {shape.matrix.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}_${c}`}
                          className={`w-4 h-4 rounded-xs ${
                            cell === 1 ? 'cube-block' : 'opacity-0'
                          }`}
                          style={{
                            backgroundColor: cell === 1 ? shape.color : 'transparent',
                          }}
                        />
                      ))
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px] mb-2">
                    {shape.name}
                  </span>

                  {/* Restore Button */}
                  <button
                    onClick={() => {
                      sounds.playRestore();
                      onRestoreShape(shape);
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-900 text-[11px] font-extrabold shadow-xs transition-transform hover:scale-102"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAr ? 'استعادة' : 'Restore'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {trashShapes.length > 0 ? (
            <button
              onClick={() => {
                sounds.playTrash();
                onEmptyTrash();
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تفريغ السلة نهائياً' : 'Empty Trash'}</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
