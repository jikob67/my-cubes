import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle2, Lock, Eye, Sparkles, Heart } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
  isAr: boolean;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
  isAr,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="policy-modal-container"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Title & Tab Switcher */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3] flex items-center justify-center mb-3">
            {activeTab === 'privacy' ? <Shield className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isAr ? 'السياسات والشروط الرسمية لـ my cubes' : 'Official Policies & Legal Terms'}
          </h2>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'privacy'
                  ? 'bg-[#00ECE3] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'terms'
                  ? 'bg-[#00ECE3] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {isAr ? 'شروط وسياسة الاستخدام' : 'Terms of Service'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {activeTab === 'privacy' ? (
            <div className="space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-[#00ECE3]/30">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-[#00ECE3]" />
                  {isAr ? '1. حماية بيانات اللاعب والخصوصية التامة' : '1. Player Privacy & Data Protection'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'نحن في منصة my cubes نولي أهمية قصوى لخصوصية مستخدمينا. يتم تخزين بيانات ملفك الشخصي ونقاط القلوب وسجلات الألعاب محلياً وبطرق آمنة لا تشارك مع أي أطراف ثالثة دون إذنك.'
                    : 'At my cubes, user privacy is our highest priority. Your profile details, Heart points, and game records are stored securely without sharing with third parties.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '2. البيانات التي نقوم بجمعها' : '2. Information We Collect'}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li>{isAr ? 'الاسم، اسم المستخدم والصورة الرمزية المختارة.' : 'Full name, username, and selected avatar.'}</li>
                  <li>{isAr ? 'إحصائيات اللعب: نقاط القلوب، عدد الانتصارات، أعلى نتيجة أسبوعية.' : 'Gameplay stats: Heart points, wins count, weekly high score.'}</li>
                  <li>{isAr ? 'عناوين معاملات العملات الرقمية لأغراض التحقق من الاشتراكات فقط.' : 'Crypto transaction references for verification purposes only.'}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '3. أمان المعاملات المالية بالعملات المشفرة' : '3. Crypto Security'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'تتم جميع عمليات الدفع عبر البلوكشين مباشرة إلى المحافظ المعتمدة دون الحاجة لربط المفاتيح الخاصة أو تفويض محافظ المستخدمين، مما يضمن أماناً بنسبة 100% لأموالك.'
                    : 'All crypto transactions occur directly on-chain to official addresses without requiring private keys or wallet connect access.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '4. المحادثات ومجتمع اللاعبين' : '4. Chats & Moderation'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'يتم فحص المحتوى العام لمنع الإساءة والكلمات البذيئة لضمان بيئة آمنة لجميع الفئات العمرية.'
                    : 'Public chat and posts are moderated to ensure a family-friendly, safe gaming environment for all ages.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300/40">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  {isAr ? '1. شروط وقواعد اللعبة والنزاهة' : '1. Fair Play & Integrity'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'يُحظر استخدام أي برامج مساعدة أو محاولات التلاعب بالنتائج ونقاط القلوب. يُعرض الحساب المخالف للحظر المباشر من مجتمع my cubes.'
                    : 'Using automated bots or exploiting gameplay mechanics is strictly prohibited and subject to immediate ban.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '2. سياسة الباقات والاشتراكات الثابتة' : '2. Fixed Subscription Policy'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'أسعار الباقات والمزايا المذكورة ثابتة ودائمة. يتم تفعيل ميزات الـ VIP (كالرسائل غير المحدودة والشارات الحصرية وتثبيت النتائج) فور إتمام خطوات التحقق المعتمدة عبر المحافظ الرقمية السبع الرسمية.'
                    : 'Plan prices and listed perks are fixed and permanent. VIP perks are unlocked upon completing verification via the official crypto wallets.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '3. سياسة نقاط القلوب والمكافآت' : '3. Heart Points & Rewards'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'يمكن استبدال 300 نقطة قلب باشتراك VIP شهري كامل، أو كسب +50 نقطة قلب عند كل مشاركة للتطبيق عبر نظام المشاركة.'
                    : '300 Heart points can be redeemed for 1 Month VIP, or earn +50 Hearts per share.'}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? '4. الدعم الفني والتواصل الرسمي' : '4. Official Support Channel'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr 
                    ? 'الدعم الفني متاح على مدار الساعة عبر المساعد الذكي، أو التواصل المباشر عبر البريد الرسمي: jikob67@gmail.com'
                    : 'Support is available 24/7 via AI helper or direct email to: jikob67@gmail.com'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Accept / Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00ECE3]/30"
          >
            {isAr ? 'فهمت وموافق على الشروط ✓' : 'I Understand & Agree ✓'}
          </button>
        </div>

      </div>
    </div>
  );
};
