import React, { useState } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Sparkles, 
  Heart, 
  Shield, 
  FileText, 
  Lock, 
  User, 
  Mail, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  FileEdit
} from 'lucide-react';
import { UserProfile } from '../../types';
import { PolicyModal } from '../Policy/PolicyModal';

interface AuthGateProps {
  onLoginSuccess: (user: UserProfile) => void;
  isAr: boolean;
}

// Preset dynamic avatars for instant generation
const AVATAR_SEEDS = [
  'CubeMaster',
  'NeonPlayer',
  'PixelHero',
  'CyberKnight',
  'GalaxyGamer',
  'SpeedCuber',
  'GoldenBlock',
  'StarPuzzle',
  'HexaChampion',
  'AuraPlayer'
];

export const AuthGate: React.FC<AuthGateProps> = ({
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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Policy Modal state
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');

  // Compute current avatar preview URL
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
    setErrorMsg('');

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال اسمك الكامل' : 'Please enter your full name');
        return;
      }
      if (!username.trim()) {
        setErrorMsg(isAr ? 'يرجى اختيار اسم مستخدم' : 'Please enter a username');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg(isAr ? 'كلمة المرور يجب أن لا تقل عن 4 خانات' : 'Password must be at least 4 characters');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg(isAr ? 'يجب الموافقة على سياسة الخصوصية وشروط الاستخدام للمتابعة' : 'You must agree to the Privacy Policy & Terms');
        return;
      }

      const cleanUsername = username.replace('@', '').trim();
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        username: cleanUsername,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        avatar: currentAvatarUrl,
        gender,
        location: location.trim(),
        bio: bio.trim() || (isAr ? `لاعب جديد في عالم my cubes! مستعد للتحدي والذكاء.` : `New player in my cubes! Ready for puzzles.`),
        hearts: 50, // Starting Welcome Bonus
        score: 0,
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
    } else {
      // Login flow
      if (!email.trim() && !username.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم' : 'Please enter email or username');
        return;
      }
      if (!password) {
        setErrorMsg(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
        return;
      }

      // Check existing users in storage or create session
      try {
        const savedUsersRaw = localStorage.getItem('mycubes_users');
        const savedUsers: UserProfile[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const found = savedUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() || u.username.toLowerCase() === username.trim().toLowerCase()
        );

        if (found) {
          onLoginSuccess(found);
          return;
        }
      } catch (e) {}

      // If logging in for the first time with credentials
      const cleanUser = (username || email.split('@')[0] || 'CubePlayer').replace('@', '').trim();
      const loginUser: UserProfile = {
        id: `user_${Date.now()}`,
        username: cleanUser,
        fullName: cleanUser,
        email: email.trim() || `${cleanUser}@mycubes.app`,
        avatar: currentAvatarUrl,
        gender: 'male',
        location: isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia',
        bio: isAr ? 'لاعب مسجل في my cubes.' : 'Registered my cubes player.',
        hearts: 50,
        score: 0,
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

      onLoginSuccess(loginUser);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white relative overflow-hidden">
      
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00ECE3]/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-xl z-10 my-8">
        
        {/* Top App Header - Brand Name Only without icons as requested */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white mb-2 drop-shadow-md">
            my cubes
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {isAr 
              ? 'مرحباً بك في منصة الألعاب والذكاء الذهني. يرجى تسجيل بياناتك الشخصية للبدء والانضمام للمجتمع.' 
              : 'Welcome to the cube puzzle platform. Please register your profile to start playing and join the community.'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          
          {/* Tabs: Register vs Sign In */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                isRegister
                  ? 'bg-[#00ECE3] text-slate-950 shadow-md shadow-[#00ECE3]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء حساب جديد' : 'Register New Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                !isRegister
                  ? 'bg-[#00ECE3] text-slate-950 shadow-md shadow-[#00ECE3]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
          </div>

          {/* Perks Banner for new registrations */}
          {isRegister && (
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-[#00ECE3]/10 via-cyan-950/40 to-rose-950/20 border border-[#00ECE3]/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#00ECE3]/20 text-[#00ECE3]">
                <Heart className="w-5 h-5 fill-[#00ECE3]" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white block">
                  {isAr ? 'هدية الانضمام الفورية:' : 'Instant Welcome Reward:'}
                </span>
                <span className="text-slate-300">
                  {isAr ? '+50 نقطة قلب ❤️ و 12 رسالة محادثة يومية مجانية' : '+50 Hearts ❤️ & 12 daily messages for free'}
                </span>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Registration / Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* AVATAR GENERATION BOX (For New Registrations) */}
            {isRegister && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative group">
                    <img
                      src={currentAvatarUrl}
                      alt="Player Avatar Preview"
                      className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-[#00ECE3] object-cover shadow-md shadow-[#00ECE3]/20 transition-transform group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#00ECE3] text-slate-950 rounded-full text-[10px]">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#00ECE3]" />
                      {isAr ? 'صورة الملف الشخصي' : 'Profile Picture'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isAr ? 'يمكنك توليد صورة رمزية فريدة بنقرة واحدة' : 'Generate a unique avatar with one click'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateNewAvatar}
                  disabled={isGeneratingAvatar}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-[#00ECE3] border border-[#00ECE3]/40 text-xs font-black flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'توليد صورة جديدة' : 'Generate Avatar'}</span>
                </button>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#00ECE3]" />
                  <span>{isAr ? 'الاسم الكامل *' : 'Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: فيصل العتيبي' : 'e.g. Faisal Al-Otaibi'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] focus:border-[#00ECE3] outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-[#00ECE3]" />
                <span>{isAr ? 'اسم المستخدم في المنصة (@) *' : 'Username (@) *'}</span>
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'مثال: CubeMaster' : 'CubeMaster'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] focus:border-[#00ECE3] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-[#00ECE3]" />
                <span>{isAr ? 'البريد الإلكتروني *' : 'Email Address *'}</span>
              </label>
              <input
                type="email"
                required
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] focus:border-[#00ECE3] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00ECE3]" />
                <span>{isAr ? 'كلمة المرور *' : 'Password *'}</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] focus:border-[#00ECE3] outline-none transition-all"
              />
            </div>

            {isRegister && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isAr ? 'الجنس *' : 'Gender *'}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none focus:ring-2 focus:ring-[#00ECE3]"
                    >
                      <option value="male">{isAr ? 'ذكر ♂' : 'Male'}</option>
                      <option value="female">{isAr ? 'أنثى ♀' : 'Female'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00ECE3]" />
                      <span>{isAr ? 'الدولة / المدينة *' : 'Location *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
                    />
                  </div>
                </div>

                {/* Bio Field (نبذة عن اللاعب) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-[#00ECE3]" />
                    <span>{isAr ? 'نبذة عن اللاعب (Bio)' : 'Player Bio'}</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'اكتب نبذة قصيرة عن اهتماماتك أو استراتيجيتك في اللعب...' : 'Write a short bio about yourself or your game strategy...'}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:ring-2 focus:ring-[#00ECE3] focus:border-[#00ECE3] outline-none resize-none transition-all"
                  />
                </div>

                {/* Privacy Policy & Terms Checkbox */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="gate-terms-check"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#00ECE3] focus:ring-[#00ECE3] accent-[#00ECE3] cursor-pointer"
                  />
                  <label htmlFor="gate-terms-check" className="leading-relaxed select-none cursor-pointer">
                    {isAr ? (
                      <>
                        أقر وأوافق على{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setPolicyType('privacy');
                            setIsPolicyOpen(true);
                          }}
                          className="font-black text-[#00ECE3] underline hover:opacity-80"
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
                          className="font-black text-[#00ECE3] underline hover:opacity-80"
                        >
                          شروط الاستخدام
                        </button>{' '}
                        المعتمدة في my cubes.
                      </>
                    ) : (
                      <>
                        I agree to the{' '}
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
                          Terms of Use
                        </button>.
                      </>
                    )}
                  </label>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00ECE3] to-cyan-400 hover:from-[#00c9c2] hover:to-cyan-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-[#00ECE3]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {isRegister
                  ? (isAr ? 'حفظ البيانات وبدء الاستخدام الآن' : 'Save Profile & Enter Platform')
                  : (isAr ? 'تسجيل الدخول للمنصة' : 'Sign In to Platform')}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>

          {/* Quick Policy links footer */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                setPolicyType('privacy');
                setIsPolicyOpen(true);
              }}
              className="hover:text-[#00ECE3] transition-colors"
            >
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setPolicyType('terms');
                setIsPolicyOpen(true);
              }}
              className="hover:text-[#00ECE3] transition-colors"
            >
              {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
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
    </div>
  );
};
