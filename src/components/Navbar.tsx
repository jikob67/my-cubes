import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Trophy, 
  Users, 
  Bell, 
  Globe, 
  MessageSquare, 
  Coins, 
  Headphones, 
  Settings as SettingsIcon, 
  Gamepad2, 
  LogOut, 
  User,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, Theme, Language } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: 'game' | 'community' | 'subscriptions' | 'support' | 'settings';
  setActiveTab: (tab: 'game' | 'community' | 'subscriptions' | 'support' | 'settings') => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  unreadNotifsCount: number;
  openNotifications: () => void;
  openProfile: () => void;
  openAuth: () => void;
  onLogout: () => void;
  allUsers: UserProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  language,
  toggleLanguage,
  unreadNotifsCount,
  openNotifications,
  openProfile,
  openAuth,
  onLogout,
  allUsers,
}) => {
  const isAr = language === 'ar';

  // Compute community stats from real users
  const totalPlayers = allUsers.length > 0 ? allUsers.length : (currentUser ? 1 : 0);
  const totalWins = allUsers.reduce((sum, u) => sum + (u.wins || 0), 0) + (currentUser?.wins || 0);

  const navItems: { id: 'game' | 'community' | 'subscriptions' | 'support' | 'settings'; labelAr: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'game', labelAr: 'اللعبة', labelEn: 'Game', icon: Gamepad2 },
    { id: 'community', labelAr: 'المجتمع والدردشة', labelEn: 'Community & Chat', icon: MessageSquare },
    { id: 'subscriptions', labelAr: 'الاشتراكات والمحافظ', labelEn: 'Subscriptions & Crypto', icon: Coins },
    { id: 'support', labelAr: 'الدعم الذكي', labelEn: 'AI Support', icon: Headphones },
    { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl bg-white/85 dark:bg-slate-950/85 border-slate-200/80 dark:border-slate-800/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('game')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white font-mono drop-shadow-xs">
                  my cubes
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3] border border-[#00ECE3]/30">
                  LIVE
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
                {isAr ? 'عالم المكعبات والألوان والذكاء' : 'Colorful Random Cube Puzzle'}
              </span>
            </div>
          </div>

          {/* Modern Floating Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all relative ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-black/5 border border-[#00ECE3]/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-[#00a8a1] dark:text-[#00ECE3] scale-110' : ''}`} />
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#00ECE3] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Hearts Counter */}
            {currentUser && (
              <div 
                id="user-hearts-badge"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 shadow-xs"
                title={isAr ? 'نقاط القلوب الخاصة بك' : 'Your Heart Points'}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="font-extrabold text-sm sm:text-base text-rose-600 dark:text-rose-400">
                  {currentUser.hearts}
                </span>
              </div>
            )}

            {/* Level & XP */}
            {currentUser && (
              <div 
                id="user-level-badge"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-[#00ECE3]/40 shadow-xs"
                title={isAr ? `مستوى اللاعب: ${currentUser.level}` : `Player Level: ${currentUser.level}`}
              >
                <Sparkles className="w-4 h-4 text-[#00a8a1] dark:text-[#00ECE3]" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {isAr ? `المستوى ${currentUser.level}` : `Lv.${currentUser.level}`}
                </span>
              </div>
            )}

            {/* Community Live Ticker (Desktop) */}
            <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#00a8a1] dark:text-[#00ECE3]" />
                {totalPlayers} {isAr ? 'لاعب' : 'players'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Trophy className="w-3.5 h-3.5" />
                {totalWins} {isAr ? 'فوز' : 'wins'}
              </span>
            </div>

            {/* Notifications Button */}
            <button
              id="notifications-btn"
              onClick={openNotifications}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={isAr ? 'التنبيهات الذكية' : 'Notifications'}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#00ECE3] ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Language Toggle */}
            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title={isAr ? 'تغيير اللغة' : 'Change Language'}
            >
              <Globe className="w-3.5 h-3.5 text-[#00a8a1] dark:text-[#00ECE3]" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Profile Avatar / Auth */}
            {currentUser ? (
              <button
                id="user-profile-btn"
                onClick={openProfile}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-[#00ECE3] transition-all border border-slate-200 dark:border-slate-700"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[80px] truncate hidden md:inline">
                  @{currentUser.username}
                </span>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#00ECE3]"
                />
              </button>
            ) : (
              <button
                id="login-register-btn"
                onClick={openAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-900 font-extrabold text-xs sm:text-sm shadow-sm transition-all hover:scale-102"
              >
                <User className="w-4 h-4" />
                <span>{isAr ? 'تسجيل / دخول' : 'Login / Register'}</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'game'
                ? 'bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            {isAr ? 'اللعبة' : 'Game'}
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {isAr ? 'المجتمع' : 'Community'}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            {isAr ? 'الاشتراكات' : 'Crypto'}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            {isAr ? 'الدعم' : 'Support'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            {isAr ? 'الإعدادات' : 'Settings'}
          </button>
        </div>

      </div>
    </header>
  );
};
