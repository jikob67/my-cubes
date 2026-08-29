import React from 'react';
import { ArrowLeft, RotateCcw, Heart, Trophy, Zap, Trash2 } from 'lucide-react';

interface GameTopBarProps {
  score: number;
  bestScore: number;
  level: number;
  difficultyLabel: string;
  onBack: () => void;
  onRestart: () => void;
  onOpenTrash: () => void;
  trashCount: number;
  isAr: boolean;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  score,
  bestScore,
  level,
  difficultyLabel,
  onBack,
  onRestart,
  onOpenTrash,
  trashCount,
  isAr,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-4 px-2 sm:px-4">
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-3xl bg-white/95 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        
        {/* Left: Back Button & Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            id="topbar-back-btn"
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-[#00ECE3] hover:text-slate-950 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-200 shadow-xs"
            title={isAr ? 'رجوع' : 'Back'}
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          {/* Difficulty / Mode Indicator */}
          <div className="flex flex-col px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              {isAr ? 'المستوى' : 'MODE'}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#00a8a1] dark:text-[#00ECE3] font-mono whitespace-nowrap">
              {difficultyLabel} {level}
            </span>
          </div>
        </div>

        {/* Center: THIS WEEK / BEST SCORE */}
        <div className="flex flex-col items-center px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {isAr ? 'نتيجة الأسبوع' : 'THIS WEEK'}
          </span>
          <span className="text-xs sm:text-base font-black text-amber-700 dark:text-amber-300 font-mono">
            {bestScore}
          </span>
        </div>

        {/* Right: SCORE with HEART + Trash + Restart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Main SCORE display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 shadow-xs">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider">
                SCORE
              </span>
              <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white font-mono leading-none">
                {score}
              </span>
            </div>
          </div>

          {/* Trash Trigger */}
          <button
            type="button"
            id="topbar-trash-btn"
            onClick={onOpenTrash}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900 transition-all shadow-xs"
            title={isAr ? 'سلة المهملات 🗑️' : 'Trash Bin 🗑️'}
          >
            <Trash2 className="w-4 h-4" />
            {trashCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono font-bold shadow-xs">
                {trashCount}
              </span>
            )}
          </button>

          {/* Restart Button ↻ */}
          <button
            type="button"
            id="topbar-restart-btn"
            onClick={onRestart}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-[#00ECE3] hover:text-slate-950 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all duration-200 shadow-xs"
            title={isAr ? 'إعادة التشغيل ↻' : 'Restart Round ↻'}
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
