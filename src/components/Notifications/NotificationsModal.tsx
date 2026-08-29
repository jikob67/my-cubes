import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Heart, 
  Gamepad2, 
  ShieldCheck, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';
import { AppNotification } from '../../types';
import { sounds } from '../../utils/sound';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateTab?: (tab: 'game' | 'community' | 'subscriptions' | 'support' | 'settings') => void;
  isAr: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateTab,
  isAr,
}) => {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'game' | 'reward' | 'social' | 'system'>('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-[#00ECE3]" />;
      case 'reward':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'social':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="notifications-dialog"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-[#00a8a1] dark:text-[#00ECE3] flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {isAr ? 'التنبيهات والإشعارات' : 'Notifications & Alerts'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00ECE3] text-slate-950">
                    {unreadCount} {isAr ? 'جديد' : 'new'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'آخر تحديثات اللعبة، نقاط القلوب والمكافآت' : 'Latest game updates, hearts & reward alerts'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills & Quick Actions */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {(
              [
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'game', labelAr: 'اللعبة', labelEn: 'Game' },
                { id: 'reward', labelAr: 'المكافآت', labelEn: 'Rewards' },
                { id: 'social', labelAr: 'المجتمع', labelEn: 'Social' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveFilter(filter.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === filter.id
                    ? 'bg-[#00ECE3] text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? filter.labelAr : filter.labelEn}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  onMarkAllAsRead();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#00a8a1] dark:text-[#00ECE3] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                title={isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'قراءة الكل' : 'Mark read'}</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(isAr ? 'هل تريد مسح جميع التنبيهات؟' : 'Clear all notifications?')) {
                    onClearAll();
                  }
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title={isAr ? 'مسح الكل' : 'Clear all'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[260px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {isAr ? 'لا توجد تنبيهات حالياً' : 'No notifications right now'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'ستظهر هنا إشعارات الجولات والمكافآت فور حدوثها' : 'Game updates & rewards will appear here'}
              </span>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.read) onMarkAsRead(item.id);
                  if (item.type === 'game' && onNavigateTab) {
                    onNavigateTab('game');
                    onClose();
                  } else if (item.type === 'social' && onNavigateTab) {
                    onNavigateTab('community');
                    onClose();
                  } else if (item.type === 'reward' && onNavigateTab) {
                    onNavigateTab('subscriptions');
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                  !item.read
                    ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-[#00ECE3]/40 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Icon */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 mt-0.5">
                  {getIconForType(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                    {item.message}
                  </p>
                </div>

                {/* Unread indicator Dot */}
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#00ECE3] shrink-0 self-center"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {isAr ? 'نظام التنبيهات المباشر my cubes' : 'my cubes Live Notifications'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#00ECE3]"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
