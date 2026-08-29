import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  LogIn, 
  Sparkles, 
  Heart, 
  Shield, 
  FileText,
  User,
  Mail,
  Lock,
  MapPin,
  FileEdit,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '../../types';
import { PolicyModal } from '../Policy/PolicyModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isAr: boolean;
}

const AVATAR_SEEDS = [
  'CubeMaster',
  'NeonPlayer',
  'PixelHero',
  'CyberKnight',
  'GalaxyGamer',
  'SpeedCuber',
  'GoldenBlock'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isAr,
}) => {
  const [isRegister, setIsRegister] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [location, setLocation] = useState(isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia');
  const [bio, setBio] = useState('');
  const [avatarSeedIndex, setAvatarSeedIndex] = useState(0);
  const [customAvatar, setCustomAvatar] = useState<string>('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Policy Modal state
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');

  if (!isOpen) return null;

  const currentAvatarUrl = customAvatar || (
    gender === 'female'
      ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username || AVATAR_SEEDS[avatarSeedIndex % AVATAR_SEEDS.length])}&backgroundColor=00ece3,ec4899,8b5cf6`
      : `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(username || AVATAR_SEEDS[avatarSeedIndex % AVATAR_SEEDS.length])}&backgroundColor=00ece3,0284c7,3b82f6`
  );

  const handleGenerateNewAvatar = () => {
    setIsGeneratingAvatar(true);
    setAvatarSeedIndex((prev) => prev + 1);
    const styles = ['bottts-neutral', 'avataaars', 'pixel-art', 'fun-emoji', 'adventurer'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = `${username || 'Player'}_${Math.random().toString(36).substring(2, 7)}`;
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(randomSeed)}&backgroundColor=00ece3,1e293b,0f172a,0284c7`;
    
    setTimeout(() => {
      setCustomAvatar(newAvatar);
      setIsGeneratingAvatar(false);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister && !agreeTerms) {
      alert(isAr ? 'يرجى الموافقة على سياسة الخصوصية وسياسة الاستخدام للمتابعة.' : 'Please agree to the Privacy Policy & Terms to proceed.');
      return;
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      username: username.replace('@', '').trim() || 'CubeChampion',
      fullName: fullName.trim() || (isAr ? 'لاعب my cubes' : 'Cube Champion'),
      email: email.trim() || 'player@mycubes.app',
      avatar: currentAvatarUrl,
      gender,
      location: location.trim() || (isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'),
      bio: bio.trim() || (isAr ? 'مستعد لتحديات المكعبات ودمج الأشكال في my cubes!' : 'Ready for cube challenges in my cubes!'),
      hearts: 50, // Starting bonus
      score: 100,
      level: 1,
      xp: 0,
      wins: 0,
      losses: 0,
      totalGames: 0,
      ratings: [5],
      isVip: false,
      freeMessagesRemaining: 12,
      referralCode: `CUBE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleDateString(),
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div 
          id="auth-modal-container"
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[95vh] overflow-y-auto"
        >
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header - Name Only */}
          <div className="flex flex-col items-center text-center mb-5">
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              my cubes
            </h2>
            <h3 className="text-sm font-bold text-[#00a8a1] dark:text-[#00ECE3] mt-1">
              {isRegister
                ? (isAr ? 'إنشاء حساب جديد' : 'Create Account')
                : (isAr ? 'تسجيل الدخول إلى حسابك' : 'Welcome Back')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRegister
                ? (isAr ? 'احصل على 50 نقطة قلب ❤️ فورية و12 رسالة يومية مجاناً!' : 'Get 50 bonus Hearts ❤️ & 12 daily messages!')
                : (isAr ? 'تابع نتائجك، نقاطك وتحديات المجتمع' : 'Track your scores and community rankings')}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Avatar generator box */}
            {isRegister && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentAvatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-xl bg-slate-900 border border-[#00ECE3] object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isAr ? 'الصورة الرمزية' : 'Avatar'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'مولدة تلقائياً بالذكاء' : 'Generated Avatar'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateNewAvatar}
                  disabled={isGeneratingAvatar}
                  className="px-3 py-1.5 rounded-lg bg-[#00ECE3]/10 hover:bg-[#00ECE3]/20 text-[#00a8a1] dark:text-[#00ECE3] border border-[#00ECE3]/30 text-xs font-black flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'توليد' : 'New'}</span>
                </button>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: فيصل العتيبي' : 'e.g. Alex Johnson'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? 'اسم المستخدم (@) *' : 'Username (@) *'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'CubeMaster' : 'CubeMaster'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
              </label>
              <input
                type="email"
                required
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? 'كلمة المرور *' : 'Password *'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
              />
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isAr ? 'الجنس *' : 'Gender *'}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="male">{isAr ? 'ذكر ♂' : 'Male'}</option>
                      <option value="female">{isAr ? 'أنثى ♀' : 'Female'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isAr ? 'الدولة / المدينة *' : 'Location *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* Bio input in modal */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'نبذة عن اللاعب (Bio)' : 'Player Bio'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'اكتب نبذة عنك...' : 'Write a bio...'}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none resize-none"
                  />
                </div>

                {/* Privacy Policy & Terms Checkbox in Registration */}
                <div className="pt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    id="modal-terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#00ECE3] focus:ring-[#00ECE3] accent-[#00ECE3] cursor-pointer"
                  />
                  <label htmlFor="modal-terms-check" className="leading-relaxed select-none cursor-pointer">
                    {isAr ? (
                      <>
                        أوافق على{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setPolicyType('privacy');
                            setIsPolicyOpen(true);
                          }}
                          className="font-black text-[#00a8a1] dark:text-[#00ECE3] underline"
                        >
                          سياسة الخصوصية
                        </button>{' '}
                        و{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setPolicyType('terms');
                            setIsPolicyOpen(true);
                          }}
                          className="font-black text-[#00a8a1] dark:text-[#00ECE3] underline"
                        >
                          شروط الاستخدام
                        </button>
                      </>
                    ) : (
                      <>
                        I agree to{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setPolicyType('privacy');
                            setIsPolicyOpen(true);
                          }}
                          className="font-black text-[#00ECE3] underline"
                        >
                          Privacy Policy
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setPolicyType('terms');
                            setIsPolicyOpen(true);
                          }}
                          className="font-black text-[#00ECE3] underline"
                        >
                          Terms
                        </button>
                      </>
                    )}
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00ECE3] to-cyan-400 hover:from-[#00c9c2] hover:to-cyan-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-[#00ECE3]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {isRegister
                ? (isAr ? 'حفظ البيانات وبدء اللعب الآن' : 'Save & Start Playing')
                : (isAr ? 'تسجيل الدخول' : 'Sign In')}
            </button>
          </form>

          {/* Switch tab text */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {isRegister
                ? (isAr ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign In')
                : (isAr ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'New player? Register Account')}
            </button>
          </div>

        </div>
      </div>

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        defaultTab={policyType}
        isAr={isAr}
      />
    </>
  );
};
