import React, { useState } from 'react';
import { Sparkles, ArrowDownToLine, Plus, Zap, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import { Shape } from '../../types';
import { sounds } from '../../utils/sound';

interface MergeBoxProps {
  mergeShapesList: Shape[];
  onAddShapeToMerge: (shape: Shape) => void;
  onRemoveFromMerge: (shapeId: string) => void;
  onExecuteMerge: () => void;
  isAr: boolean;
}

export const MergeBox: React.FC<MergeBoxProps> = ({
  mergeShapesList,
  onAddShapeToMerge,
  onRemoveFromMerge,
  onExecuteMerge,
  isAr,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const shape: Shape = JSON.parse(data);
        onAddShapeToMerge(shape);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalCubesInMerge = mergeShapesList.reduce((sum, s) => sum + s.cubesCount, 0);

  return (
    <div
      id="merge-shapes-box"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-full max-w-xl p-3.5 sm:p-4 rounded-3xl transition-all duration-300 border-2 ${
        mergeShapesList.length > 0
          ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-[#00ECE3] shadow-xl shadow-[#00ECE3]/15'
          : 'bg-slate-50/90 dark:bg-slate-900/80 border-dashed border-slate-300 dark:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#00ECE3]/20 flex items-center justify-center text-[#00a8a1] dark:text-[#00ECE3] shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                {isAr ? 'منطقة دمج وتركيب الأشكال' : 'Shape Fusion & Merge Studio'}
              </h4>
              <button
                type="button"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="p-1 text-slate-400 hover:text-[#00a8a1] dark:hover:text-[#00ECE3] transition-colors"
                title={isAr ? 'كيف تعمل هذه المنطقة؟' : 'How does this work?'}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {isAr 
                ? '💡 وظيفتها: ادمج شكلين لتكوين قطعة واحدة جديدة كلياً تساعدك في ملء فراغات الشبكة!' 
                : '💡 Purpose: Fuse 2+ small shapes into 1 custom composite shape to fill grid gaps!'}
            </p>
          </div>
        </div>

        {mergeShapesList.length >= 2 && (
          <button
            type="button"
            id="execute-merge-btn"
            onClick={() => {
              sounds.playMerge();
              onExecuteMerge();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00ECE3] to-cyan-400 hover:from-cyan-300 hover:to-[#00ECE3] text-slate-950 font-black text-xs shadow-lg shadow-[#00ECE3]/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{isAr ? `دمج (${totalCubesInMerge} مكعبات) 🔥` : `Fuse (${totalCubesInMerge} Cubes) 🔥`}</span>
          </button>
        )}
      </div>

      {/* Step-by-Step Clarity Guide (Expandable or visible when needed) */}
      {showHowItWorks && (
        <div className="mb-3 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
          <div className="font-extrabold text-[#00ECE3] flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>{isAr ? 'دليل مبسط: كيف تستفيد من منطقة الدمج؟' : 'Guide: How Shape Fusion Works:'}</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300 dark:text-slate-300">
            <li>{isAr ? '1. انقر على زر (دمج) بجانب زر التدوير على أي شكل لنقله مباشرة إلى هنا.' : '1. Click the (Merge) button next to the rotate button on any shape to move it here.'}</li>
            <li>{isAr ? '2. انقر على زر (دمج) للشكل الثاني لإضافته بجانب الشكل الأول.' : '2. Click the (Merge) button on a 2nd shape to add it alongside.'}</li>
            <li>{isAr ? '3. اضغط على زر (دمج المكعبات) لتندمج القطع في شكل هندسي مركب جديد كلياً.' : '3. Click the fusion button to combine them into one new composite shape.'}</li>
            <li>{isAr ? '4. استخدم الشكل الجديد لسد الفراغات الصعبة في الشبكة وكسب نقاط إضافية.' : '4. Use the new fused shape to fill complex grid gaps and earn bonus points.'}</li>
          </ul>
        </div>
      )}

      {/* Shapes inside merge box */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-h-[75px] p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
        {mergeShapesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2 text-slate-400 dark:text-slate-500 text-xs text-center">
            <ArrowDownToLine className="w-5 h-5 mb-1 text-[#00ECE3] animate-bounce" />
            <span className="font-bold">{isAr ? 'انقر على زر (دمج) بجانب زر التدوير على أي شكل لإضافته إلى هنا' : 'Click the (Merge) button next to rotate on any shape to add it here'}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isAr ? '(أو يمكنك سحبه وإفلاته داخل هذا المربع)' : '(Or drag and drop it into this box)'}
            </span>
          </div>
        ) : (
          mergeShapesList.map((shape, idx) => (
            <React.Fragment key={shape.id}>
              {idx > 0 && (
                <div className="text-slate-400 dark:text-slate-500 font-bold text-sm">
                  <Plus className="w-4 h-4 text-[#00ECE3]" />
                </div>
              )}
              <div className="relative group p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
                <button
                  onClick={() => onRemoveFromMerge(shape.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] hover:scale-110 shadow-xs"
                  title={isAr ? 'إلغاء من الدمج' : 'Remove from merge'}
                >
                  ✕
                </button>

                <div
                  className="grid gap-0.5"
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
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-1 truncate max-w-[60px]">
                  {shape.name}
                </span>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

    </div>
  );
};
