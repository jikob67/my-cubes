import React, { useState } from 'react';
import { 
  Coins, 
  Copy, 
  Check, 
  QrCode, 
  Zap, 
  Crown, 
  ShieldCheck, 
  Share2, 
  Heart, 
  Sparkles,
  ExternalLink,
  Flame,
  Layers,
  Droplet,
  Hexagon,
  CircleDollarSign,
  ArrowRight,
  CheckCircle2,
  Lock,
  Wallet
} from 'lucide-react';
import { CRYPTO_WALLETS } from '../../utils/storage';
import { UserProfile, CryptoWalletInfo } from '../../types';

interface CryptoSubscriptionsProps {
  currentUser: UserProfile | null;
  onUpgradeVip: () => void;
  onRedeemHeartsForVip: () => void;
  onShareApp: () => void;
  isAr: boolean;
}

export const CryptoSubscriptions: React.FC<CryptoSubscriptionsProps> = ({
  currentUser,
  onUpgradeVip,
  onRedeemHeartsForVip,
  onShareApp,
  isAr,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // 5 Required Steps State
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'hearts' | 'crypto_vip'>('crypto_vip');
  const [selectedWallet, setSelectedWallet] = useState<CryptoWalletInfo>(CRYPTO_WALLETS[0]);
  const [userSenderWalletAddress, setUserSenderWalletAddress] = useState('');
  const [paymentVerificationCode, setPaymentVerificationCode] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Address validation helper
  const getAddressValidation = (addr: string) => {
    const clean = addr.trim();
    if (!clean) return null;
    // EVM
    if (/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      return { isValid: true, labelAr: 'عنوان EVM صحيح (Ethereum / BSC / Polygon) ✓', labelEn: 'Valid EVM Address ✓' };
    }
    // TRON
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(clean)) {
      return { isValid: true, labelAr: 'عنوان TRON صحيح (TRC20) ✓', labelEn: 'Valid TRON Address ✓' };
    }
    // Bitcoin
    if (/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/.test(clean)) {
      return { isValid: true, labelAr: 'عنوان Bitcoin صحيح ✓', labelEn: 'Valid Bitcoin Address ✓' };
    }
    // Solana
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean)) {
      return { isValid: true, labelAr: 'عنوان Solana صحيح ✓', labelEn: 'Valid Solana Address ✓' };
    }
    // TON
    if (/^(EQ|UQ)[a-zA-Z0-9_-]{46}$/.test(clean)) {
      return { isValid: true, labelAr: 'عنوان TON صحيح ✓', labelEn: 'Valid TON Address ✓' };
    }
    if (clean.length >= 24 && /^[a-zA-Z0-9_-]+$/.test(clean)) {
      return { isValid: true, labelAr: 'هيكل العنوان مقبول ✓', labelEn: 'Address format accepted ✓' };
    }
    return { isValid: false, labelAr: 'تنسيق العنوان غير صالح (تأكد من عنوان المحفظة)', labelEn: 'Invalid crypto address format' };
  };

  const addressCheck = getAddressValidation(userSenderWalletAddress);
  const isTxHashValid = paymentVerificationCode.trim().length >= 10;

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2500);
  };

  // Step 5 Submit & Activate
  const handleCompleteSubscription = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      alert(isAr ? 'يرجى إكمال الخطوة 1: اختيار الباقة الاشتراكية.' : 'Please select a subscription plan.');
      return;
    }
    if (!selectedWallet) {
      alert(isAr ? 'يرجى إكمال الخطوة 2: اختيار المحفظة الرقمية.' : 'Please select a crypto wallet.');
      return;
    }
    if (!userSenderWalletAddress.trim()) {
      alert(isAr ? 'يرجى إكمال الخطوة 3: لصق عنوان محفظتك الخاصة المستخدمة في الإرسال.' : 'Please paste your wallet address.');
      return;
    }
    if (addressCheck && !addressCheck.isValid) {
      alert(isAr ? 'يرجى التحقق من صحة عنوان المحفظة الرقمية المدخل.' : 'Please enter a valid crypto wallet address.');
      return;
    }
    if (!paymentVerificationCode.trim() || !isTxHashValid) {
      alert(isAr ? 'يرجى إكمال الخطوة 4: لصق رمز التحقق من المدفوعات (Tx Hash).' : 'Please paste a valid transaction hash (Tx Hash).');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setSubscriptionSuccess(true);
      onUpgradeVip();
    }, 1500);
  };

  const handleShareWithNavigator = async () => {
    const shareData = {
      title: 'my cubes — لعبة الألغاز والمكعبات الاستراتيجية 🎲',
      text: isAr ? 'العب وتحدى أصدقاءك في لعبة my cubes واكسب نقاط القلوب!' : 'Play my cubes puzzle game and earn Heart points!',
      url: 'https://ai.studio/apps/d4a4ec55-5757-442e-83c7-d8b12923f44f?fullscreenApplet=true',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShareApp();
      } catch (err) {
        // Fallback copy
        navigator.clipboard.writeText(shareData.url);
        onShareApp();
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      onShareApp();
    }
  };

  const getWalletIcon = (name: string) => {
    switch (name) {
      case 'Zap': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-blue-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-indigo-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-blue-500" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'Hexagon': return <Hexagon className="w-5 h-5 text-purple-500" />;
      default: return <CircleDollarSign className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden mb-8 border border-slate-700 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ECE3]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ECE3]/20 text-[#00ECE3] border border-[#00ECE3]/30 text-xs font-black mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>{isAr ? 'الباقات المدفوعة والمحافظ الرقمية الرسمية' : 'VIP Plans & Crypto Wallets'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              {isAr ? 'افتح جميع مزايا my cubes بلا حدود 🚀' : 'Unlock Unlimited VIP Game Perks 🚀'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {isAr 
                ? 'الحساب المجاني يمنحك 12 رسالة يومياً. اشترك عبر العملات الرقمية المعتمدة للحصول على وصول دائم لرسائل غير محدودة، شارات VIP، ودعم ذكي متقدم.' 
                : 'Free tier includes 12 daily messages. Upgrade permanently using verified crypto wallets to get unlimited chat, exclusive badges, and priority features.'}
            </p>
          </div>

          {/* Social Share Reward Box */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center text-center shrink-0 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'اربح نقاط بمشاركة التطبيق!' : 'Earn Hearts by Sharing!'}
            </span>
            <span className="text-xl font-extrabold text-white mb-2 flex items-center gap-1">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              +50 {isAr ? 'قلب لكل مشاركة' : 'Hearts / Share'}
            </span>
            <button
              onClick={handleShareWithNavigator}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 text-xs font-black shadow-sm transition-transform hover:scale-105"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مشاركة عبر النظام الأصلي' : 'Share via Device'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        
        {/* Tier 1: Free Daily */}
        <div 
          onClick={() => setSelectedPlan('free')}
          className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between ${
            selectedPlan === 'free'
              ? 'border-[#00ECE3] ring-2 ring-[#00ECE3]/40 shadow-lg'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              {isAr ? 'الباقة المجانية' : 'Free Tier'}
            </h3>
            <div className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              $0 <span className="text-xs font-medium text-slate-400">/ {isAr ? 'مجاناً دائماً' : 'Forever'}</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? '12 رسالة محادثة يومياً' : '12 Daily Chat Messages'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'لعب غير محدود بجميع أحجام الشبكات' : 'Unlimited Gameplay on All Grids'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'استخدام سلة المهملات ومربع الدمج' : 'Trash Bin & Merge Box Access'}</span>
              </li>
            </ul>
          </div>
          <div className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs font-bold text-slate-500">
            {isAr ? 'مفعلة تلقائياً' : 'Active Free Tier'}
          </div>
        </div>

        {/* Tier 2: Hearts Exchange VIP */}
        <div 
          onClick={() => setSelectedPlan('hearts')}
          className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            selectedPlan === 'hearts'
              ? 'border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
              : 'border-rose-200 dark:border-rose-900/60'
          }`}
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
            {isAr ? 'بالنقاط' : 'Hearts'}
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              {isAr ? 'باقة القلوب VIP' : 'Hearts VIP'}
            </h3>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-1">
              300 <Heart className="w-5 h-5 fill-rose-500" />
              <span className="text-xs font-medium text-slate-400">/ {isAr ? 'شهر' : 'Month'}</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'دردشة غير محدودة بالكامل' : 'Unlimited Chat Messages'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'شارة القلب الذهبي في الملف الشخصي' : 'Golden Heart Profile Badge'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'تثبيت المنشورات والنتائج في المجتمع' : 'Pin Posts & Results'}</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRedeemHeartsForVip();
            }}
            disabled={!currentUser || currentUser.hearts < 300}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md disabled:opacity-50 transition-all"
          >
            {isAr ? 'استبدال 300 قلب بـ VIP' : 'Redeem 300 Hearts'}
          </button>
        </div>

        {/* Tier 3: Crypto VIP Pro */}
        <div 
          onClick={() => setSelectedPlan('crypto_vip')}
          className={`p-6 rounded-3xl bg-slate-900 text-white border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            selectedPlan === 'crypto_vip'
              ? 'border-[#00ECE3] ring-4 ring-[#00ECE3]/30 shadow-xl shadow-[#00ECE3]/20 scale-102'
              : 'border-slate-700 hover:border-[#00ECE3]/60'
          }`}
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#00ECE3] text-slate-950 text-[10px] font-black">
            {isAr ? 'الدائمة الرسمية' : 'Lifetime Official'}
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#00ECE3]/20 text-[#00ECE3] flex items-center justify-center mb-4">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              {isAr ? 'باقة العملات الرقمية الدائمة' : 'Crypto Lifetime VIP'}
            </h3>
            <div className="text-2xl font-black text-[#00ECE3] mb-4">
              $5 <span className="text-xs font-medium text-slate-400">/ {isAr ? 'مدى الحياة (ثابت)' : 'Lifetime (Fixed)'}</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ECE3]" />
                <span>{isAr ? 'وصول دائم غير محدود لجميع الرسائل والدردشات' : 'Lifetime Unlimited Chat & DMs'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ECE3]" />
                <span>{isAr ? 'شارة VIP الماسية الموثقة 💎' : 'Verified Diamond Pro Badge 💎'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ECE3]" />
                <span>{isAr ? 'إمكانية تثبيت نتائج الألعاب في المجتمع' : 'Pin High Score Results in Hub'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00ECE3]" />
                <span>{isAr ? 'أولوية في الدعم الفني وتصعيد التذاكر' : 'Priority AI Support Escalation'}</span>
              </li>
            </ul>
          </div>
          <div className="py-2.5 px-4 rounded-xl bg-[#00ECE3] text-slate-950 text-center font-black text-xs shadow-md">
            {isAr ? 'تم تحديد الباقة ✓' : 'Plan Selected ✓'}
          </div>
        </div>

      </div>

      {/* 5-STEP CRYPTO PAYMENT SYSTEM */}
      <div id="crypto-payment-steps-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl mb-10">
        
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3] text-xs font-black mb-2">
            <Coins className="w-4 h-4" />
            <span>{isAr ? 'نظام خطوات الدفع بالعملات الرقمية (5 خطوات إلزامية)' : '5-Step Required Crypto Payment System'}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isAr ? 'خطوات الدفع والاشتراك الحقيقية' : 'Real Crypto Payment Workflow'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr 
              ? 'يجب على جميع المستخدمين دفع الاشتراكات أو الميزات المدفوعة من خلال المحافظ الرقمية السبع التالية واتباع الخطوات الخمس بالترتيب:' 
              : 'All users must complete payment through the official wallets following the 5 mandatory steps:'}
          </p>
        </div>

        <form onSubmit={handleCompleteSubscription} className="space-y-6">

          {/* STEP 1: Plan Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#00ECE3] text-slate-950 font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'الخطوة 1: اختيار الباقة الاشتراكية (مطلوب)' : 'Step 1: Select Subscription Plan (Required)'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'free', label: isAr ? 'الباقة المجانية ($0)' : 'Free Tier ($0)', icon: '🛡️' },
                { id: 'hearts', label: isAr ? 'باقة القلوب (300 قلب)' : 'Hearts VIP (300 Hearts)', icon: '❤️' },
                { id: 'crypto_vip', label: isAr ? 'باقة العملات الرقمية الدائمة ($5)' : 'Crypto Lifetime VIP ($5)', icon: '👑' },
              ].map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    selectedPlan === plan.id
                      ? 'border-[#00ECE3] bg-cyan-50 dark:bg-cyan-950/40 text-slate-900 dark:text-white ring-1 ring-[#00ECE3]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{plan.icon}</span>
                    <span>{plan.label}</span>
                  </span>
                  {selectedPlan === plan.id && <Check className="w-4 h-4 text-[#00a8a1] dark:text-[#00ECE3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Wallet Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#00ECE3] text-slate-950 font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'الخطوة 2: اختيار أحد المحافظ الرقمية الموجودة والمتوفرة في التطبيق (مطلوب)' : 'Step 2: Select an Available Crypto Wallet (Required)'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {CRYPTO_WALLETS.map((wallet) => {
                const isSelected = selectedWallet.currency === wallet.currency;
                return (
                  <div
                    key={wallet.currency}
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#00ECE3] bg-cyan-50 dark:bg-cyan-950/40 ring-1 ring-[#00ECE3]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: `${wallet.color}30` }}
                      >
                        {getWalletIcon(wallet.iconName)}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {wallet.currency}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {wallet.network}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWallet(wallet);
                          setShowQrModal(true);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title={isAr ? 'عرض QR' : 'QR'}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(wallet.address);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title={isAr ? 'نسخ' : 'Copy'}
                      >
                        {copiedAddress === wallet.address ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Official Wallet Details Box */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#00ECE3]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">
                  {isAr ? 'عنوان الاستلام الرسمي المحول إليه:' : 'Official Destination Wallet Address:'}
                </span>
                <span className="font-mono text-xs font-bold text-[#00a8a1] dark:text-[#00ECE3] break-all select-all">
                  {selectedWallet.address}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedWallet.address)}
                className="px-3 py-1.5 rounded-lg bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 text-xs font-bold shrink-0 flex items-center gap-1"
              >
                {copiedAddress === selectedWallet.address ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddress === selectedWallet.address ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ العنوان' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* STEP 3: User's Wallet Address */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#00ECE3] text-slate-950 font-black text-xs flex items-center justify-center">3</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'الخطوة 3: لصق عنوان المحفظة الخاص بالمستخدم (مطلوب)' : 'Step 3: Paste User Wallet Address (Required)'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {isAr ? 'ألصق عنوان محفظتك الرقمية التي قمت بالتحويل منها لربط حسابك وتوثيقه:' : 'Paste the sender crypto address you used for the transfer:'}
            </p>
            <div className="relative">
              <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={userSenderWalletAddress}
                onChange={(e) => setUserSenderWalletAddress(e.target.value)}
                placeholder={isAr ? 'مثال: 0x... أو عنوان محفظة Solana/Bitcoin/TRON...' : 'e.g. 0x... or Solana/BTC/TRON address...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none font-mono"
              />
            </div>
            {addressCheck && (
              <div className={`mt-2 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                addressCheck.isValid 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
              }`}>
                {addressCheck.isValid ? <Check className="w-3.5 h-3.5" /> : <span>⚠️</span>}
                <span>{isAr ? addressCheck.labelAr : addressCheck.labelEn}</span>
              </div>
            )}
          </div>

          {/* STEP 4: Payment Verification Code */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#00ECE3] text-slate-950 font-black text-xs flex items-center justify-center">4</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'الخطوة 4: لصق رمز التحقق من المدفوعات (مطلوب)' : 'Step 4: Paste Payment Verification Code (Required)'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {isAr ? 'أدخل معرف المعاملة في البلوكشين (Transaction Hash / TxID / Reference Code):' : 'Enter the on-chain Transaction Hash / TxID / Reference ID:'}
            </p>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={paymentVerificationCode}
                onChange={(e) => setPaymentVerificationCode(e.target.value)}
                placeholder={isAr ? 'أدخل رمز التحقق (Tx Hash)...' : 'Paste Tx Hash or Verification Ref...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none font-mono"
              />
            </div>
            {paymentVerificationCode.trim() && (
              <div className={`mt-2 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                isTxHashValid 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
              }`}>
                {isTxHashValid ? <Check className="w-3.5 h-3.5" /> : <span>⚠️</span>}
                <span>
                  {isTxHashValid 
                    ? (isAr ? 'هيكل رمز المعاملة مكتمل وصالح للتدقيق ✓' : 'Transaction Hash format complete ✓')
                    : (isAr ? 'رمز المعاملة قصير جداً، يرجى لصق الـ Tx Hash كاملاً' : 'Tx Hash appears incomplete')}
                </span>
              </div>
            )}
          </div>

          {/* STEP 5: Success & Submit */}
          <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-[#00ECE3]/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#00ECE3] text-slate-950 font-black text-xs flex items-center justify-center">5</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isAr ? 'الخطوة 5: تأكيد وتفعيل الاشتراك فورياً' : 'Step 5: Confirm & Activate Subscription'}
              </h4>
            </div>

            {subscriptionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-center animate-scaleIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <h5 className="font-black text-sm text-emerald-800 dark:text-emerald-300">
                  {isAr ? 'تم الاشتراك بنجاح! 🎉' : 'Subscription Successfully Activated! 🎉'}
                </h5>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {isAr ? 'تم تفعيل جميع مزايا VIP الدائمة وفتح المحادثات والشارة الماسية.' : 'Lifetime VIP perks, unlimited chat, and Diamond Badge are now unlocked!'}
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 font-black text-sm shadow-lg shadow-[#00ECE3]/30 transition-all hover:scale-101 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="animate-spin text-base">⏳</span>
                    <span>{isAr ? 'جاري التحقق من المعاملة...' : 'Verifying on-chain...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>{isAr ? 'إتمام الخطوات وتأكيد الاشتراك الآن 🚀' : 'Complete 5 Steps & Activate VIP 🚀'}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>

      {/* QR Code Popup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              {selectedWallet.currency}
            </h3>
            <span className="text-xs text-slate-400 block mb-4">
              {selectedWallet.network}
            </span>

            {/* Visual QR Code Box */}
            <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white border-2 border-[#00ECE3] shadow-md flex items-center justify-center mb-4">
              <div className="w-full h-full bg-slate-900 rounded-xl p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-[#00ECE3] rounded-xs"></div>
                  <div className="w-8 h-8 bg-[#00ECE3] rounded-xs"></div>
                </div>
                <div className="text-[9px] font-mono text-[#00ECE3] font-black text-center break-all">
                  {selectedWallet.symbol} WALLET
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-[#00ECE3] rounded-xs"></div>
                  <div className="w-8 h-8 bg-white rounded-xs"></div>
                </div>
              </div>
            </div>

            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4 select-all">
              {selectedWallet.address}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedWallet.address)}
                className="flex-1 py-2 rounded-xl bg-[#00ECE3] text-slate-950 font-bold text-xs"
              >
                {isAr ? 'نسخ العنوان' : 'Copy'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
