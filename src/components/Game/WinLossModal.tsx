import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Trophy, Sparkles, RefreshCw, Frown, Award, Share2, Play } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface WinLossModalProps {
  status: 'won' | 'lost' | 'playing';
  roundHeartsEarned: number;
  score: number;
  bestScore: number;
  onNewRound: () => void;
  onShareResult?: () => void;
  isAr: boolean;
}

export const WinLossModal: React.FC<WinLossModalProps> = ({
  status,
  roundHeartsEarned,
  score,
  bestScore,
  onNewRound,
  onShareResult,
  isAr,
}) => {
  useEffect(() => {
    if (status === 'won') {
      sounds.playWin();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ECE3', '#FF2A6D', '#FFD166', '#06D6A0', '#7928CA', '#FFFFFF'],
      });
    } else if (status === 'lost') {
      sounds.playLoss();
    }
  }, [status]);

  if (status === 'playing') return null;

  const isWon = status === 'won';
  const isNewHighScore = score > 0 && score >= bestScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        id="win-loss-modal-box"
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-[#00ECE3]/40 shadow-2xl text-center relative overflow-hidden transition-all scale-100"
      >
        {/* Ambient Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isWon ? 'bg-[#00ECE3]' : 'bg-rose-500'
          }`}
        />

        {/* Icon & Title */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${
              isWon
                ? 'bg-gradient-to-tr from-[#00ECE3] to-cyan-200 text-slate-950 shadow-[#00ECE3]/40 animate-bounce'
                : 'bg-rose-100 dark:bg-rose-950/50 text-rose-500 shadow-rose-500/20'
            }`}
          >
            {isWon ? <Trophy className="w-10 h-10" /> : <Frown className="w-10 h-10" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            {isWon
              ? isAr
                ? 'انتصار رائع! 🏆'
                : 'Victorious! 🏆'
              : isAr
              ? 'Game Over'
              : 'Game Over'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
            {isWon
              ? isAr
                ? 'لقد حققت أداءً مبهراً ومسحت صفوفاً وأعمدة بذكاء!'
                : 'Outstanding strategy! You placed cubes and cleared lines brilliantly.'
              : isAr
              ? 'لم يعد هناك مكان صالح لوضع الأشكال المتاحة في الشبكة.'
              : 'No more valid moves available on the grid for the remaining shapes.'}
          </p>

          {isNewHighScore && (
            <div className="mb-4 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Award className="w-4 h-4" />
              <span>{isAr ? 'رقم قياسي جديد للأسبوع! 🌟' : 'New Best Score This Week! 🌟'}</span>
            </div>
          )}

          {/* Reward Hearts & Score Card */}
          <div className="w-full grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {isAr ? 'نقاط القلوب' : 'Heart Points'}
              </span>
              <div className="flex items-center gap-1.5 text-rose-500 font-black text-xl sm:text-2xl">
                <Heart className="w-6 h-6 fill-rose-500 animate-pulse" />
                <span>{roundHeartsEarned >= 0 ? `+${roundHeartsEarned}` : roundHeartsEarned}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {isAr ? 'النتيجة الإجمالية' : 'Total Score'}
              </span>
              <div className="flex items-center gap-1 text-[#00a8a1] dark:text-[#00ECE3] font-black text-xl sm:text-2xl">
                <Sparkles className="w-5 h-5" />
                <span>{score}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <button
              type="button"
              id="modal-play-again-btn"
              onClick={onNewRound}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#00ECE3] hover:bg-cyan-300 text-slate-950 font-black text-sm transition-all duration-200 shadow-lg shadow-[#00ECE3]/30 hover:scale-102"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isAr ? 'إعادة اللعب ↻' : 'Play Again ↻'}</span>
            </button>

            {onShareResult && (
              <button
                type="button"
                id="modal-share-result-btn"
                onClick={onShareResult}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#00ECE3]" />
                <span className="whitespace-nowrap">{isAr ? 'مشاركة النتيجة' : 'Share'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
