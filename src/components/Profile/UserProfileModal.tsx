import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Trophy, 
  Sparkles, 
  MapPin, 
  User, 
  Star, 
  AlertTriangle, 
  Check, 
  ShieldCheck, 
  Edit3,
  Coins,
  FileText,
  Shield,
  RefreshCw,
  Mail,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { UserProfile } from '../../types';
import { PolicyModal } from '../Policy/PolicyModal';

interface UserProfileModalProps {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onSubmitReview?: (targetUserId: string, rating: number, comment: string) => void;
  onSubmitReport?: (targetUserId: string, reason: string, details: string) => void;
  isAr: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  isOpen,
  onClose,
  onUpdateProfile,
  onSubmitReview,
  onSubmitReport,
  isAr,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isRegeneratingAvatar, setIsRegeneratingAvatar] = useState(false);

  // Policy Modal state
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');

  // Review state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Report state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('غش أو مخالفة شروط اللعبة');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isOpen || !user) return null;

  const isOwnProfile = currentUser?.id === user.id;

  const handleGenerateNewAvatar = () => {
    setIsRegeneratingAvatar(true);
    const styles = ['bottts-neutral', 'avataaars', 'pixel-art', 'fun-emoji', 'adventurer'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = `${user.username}_${Math.random().toString(36).substring(2, 7)}`;
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(randomSeed)}&backgroundColor=00ece3,1e293b,0f172a,0284c7`;
    
    setTimeout(() => {
      setAvatar(newAvatar);
      setIsRegeneratingAvatar(false);
    }, 250);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        fullName,
        bio,
        location,
        avatar,
      });
    }
    setIsEditing(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitReview) {
      onSubmitReview(user.id, ratingInput, reviewComment);
      setReviewSubmitted(true);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitReport) {
      onSubmitReport(user.id, reportReason, reportDetails);
      setReportSubmitted(true);
    }
  };

  const avgRating = user.ratings.length > 0
    ? (user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length).toFixed(1)
    : '5.0';

  const winRatio = user.totalGames > 0
    ? Math.round((user.wins / user.totalGames) * 100)
    : 100;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div 
          id="user-profile-modal-container"
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          
          {/* Header with Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {isAr ? 'الملف الشخصي والبيانات المسجلة' : 'Player Profile & Information'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info Card */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              {/* Avatar Generator in Edit Mode */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-[#00ECE3]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isAr ? 'الصورة الشخصية' : 'Avatar'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'توليد ذكي أو تغيير' : 'AI generated'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateNewAvatar}
                  disabled={isRegeneratingAvatar}
                  className="px-3 py-1.5 rounded-xl bg-[#00ECE3]/10 hover:bg-[#00ECE3]/20 text-[#00a8a1] dark:text-[#00ECE3] border border-[#00ECE3]/30 text-xs font-black flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingAvatar ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'توليد جديدة' : 'Generate'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'رابط مباشر للصورة (اختياري)' : 'Avatar URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الموقع الجغرافي' : 'Location'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'نبذة عن اللاعب (Bio)' : 'Bio'}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 text-xs font-black"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center">
              
              {/* Avatar & Badges */}
              <div className="relative mb-3">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#00ECE3]/50 shadow-lg bg-slate-900"
                />
                {user.isVip && (
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#00ECE3] text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-0.5">
                    <span>VIP</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                {user.fullName}
              </h3>
              <span className="text-xs font-mono font-bold text-[#00a8a1] dark:text-[#00ECE3] mb-1">
                @{user.username}
              </span>

              {/* Personal Details Panel (كل البيانات المدخلة في إنشاء الحساب) */}
              <div className="w-full my-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right rtl:text-right ltr:text-left space-y-2">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#00ECE3]" />
                  <span>{isAr ? 'البيانات الشخصية المسجلة:' : 'Registered Personal Data:'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-[#00ECE3]" />
                    <span className="font-bold">{isAr ? 'الجنس:' : 'Gender:'}</span>
                    <span>{user.gender === 'male' ? (isAr ? 'ذكر ♂' : 'Male') : (isAr ? 'أنثى ♀' : 'Female')}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#00ECE3]" />
                    <span className="font-bold">{isAr ? 'الموقع:' : 'Location:'}</span>
                    <span className="truncate">{user.location || (isAr ? 'غير محدد' : 'Global')}</span>
                  </div>

                  {user.email && (
                    <div className="col-span-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#00ECE3] shrink-0" />
                      <span className="font-bold shrink-0">{isAr ? 'البريد:' : 'Email:'}</span>
                      <span className="truncate text-[11px] font-mono">{user.email}</span>
                    </div>
                  )}

                  <div className="col-span-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-[#00ECE3] shrink-0" />
                    <span className="font-bold shrink-0">{isAr ? 'تاريخ الانضمام:' : 'Joined:'}</span>
                    <span>{user.joinedAt || user.createdAt}</span>
                  </div>
                </div>

                {/* Bio Display */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isAr ? 'نبذة عن اللاعب (Bio):' : 'Bio:'}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl">
                    "{user.bio || (isAr ? 'لاعب محترف في لعبة my cubes!' : 'Pro player in my cubes!')}"
                  </p>
                </div>
              </div>

              {/* Edit button if own profile */}
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mb-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تعديل الملف وتوليد صورة جديدة' : 'Edit Profile & Avatar'}</span>
                </button>
              )}

              {/* Stats Grid */}
              <div className="w-full grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                    {isAr ? 'نقاط القلوب' : 'Hearts'}
                  </span>
                  <span className="font-black text-rose-500 flex items-center gap-1 text-sm sm:text-base">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    {user.hearts}
                  </span>
                </div>

                <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                    {isAr ? 'نسبة الانتصارات' : 'Win Rate'}
                  </span>
                  <span className="font-black text-emerald-500 text-sm sm:text-base">
                    {winRatio}% ({user.wins}W)
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                    {isAr ? 'تقييم اللاعب' : 'Rating'}
                  </span>
                  <span className="font-black text-amber-500 flex items-center gap-1 text-sm sm:text-base">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {avgRating}
                  </span>
                </div>
              </div>

              {/* Policies & Terms Links in Profile */}
              <div className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isAr ? 'السياسات والشروط المعتمدة:' : 'Legal Policies & Terms:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyType('privacy');
                      setIsPolicyOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#00a8a1] dark:hover:text-[#00ECE3] transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#00ECE3]" />
                    <span>{isAr ? 'سياسة الخصوصية' : 'Privacy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPolicyType('terms');
                      setIsPolicyOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#00a8a1] dark:hover:text-[#00ECE3] transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#00ECE3]" />
                    <span>{isAr ? 'سياسة الاستخدام' : 'Terms'}</span>
                  </button>
                </div>
              </div>

              {/* Community Review / Report Section (When viewing other players) */}
              {!isOwnProfile && (
                <div className="w-full space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Rating Form */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left rtl:text-right">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-2">
                      {isAr ? 'تقييم اللاعب ومهاراته ⭐' : 'Rate Player Skills ⭐'}
                    </span>
                    {reviewSubmitted ? (
                      <div className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>{isAr ? 'تم إرسال تقييمك بنجاح!' : 'Review submitted successfully!'}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingInput
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder={isAr ? 'أضف تعليقاً على مستوى اللاعب (اختياري)...' : 'Add feedback comment...'}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                        >
                          {isAr ? 'إرسال التقييم' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Abuse Report Option */}
                  <div>
                    {!showReportForm ? (
                      <button
                        onClick={() => setShowReportForm(true)}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1 mx-auto"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الإبلاغ عن إساءة أو انتهاك' : 'Report Abuse or Cheating'}</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left rtl:text-right">
                        <span className="text-xs font-bold text-rose-500 block mb-2">
                          {isAr ? 'تقديم بلاغ عن اللاعب ⚠️' : 'Report Player ⚠️'}
                        </span>
                        {reportSubmitted ? (
                          <div className="text-xs text-rose-400 font-bold">
                            {isAr ? 'تم استلام بلاغك وتتم مراجعته حالياً من الإدارة.' : 'Report submitted and under review.'}
                          </div>
                        ) : (
                          <form onSubmit={handleReportSubmit} className="space-y-2">
                            <select
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                            >
                              <option value="غش أو استخدام برامج غير مصرحة">{isAr ? 'غش أو استخدام برامج غير مصرحة' : 'Cheating'}</option>
                              <option value="سلوك مسيء أو لغة غير لائقة">{isAr ? 'سلوك مسيء أو لغة غير لائقة' : 'Toxic behavior'}</option>
                              <option value="انتحال شخصية أو سبام">{isAr ? 'انتحال شخصية أو سبام' : 'Spam or impersonation'}</option>
                            </select>
                            <textarea
                              rows={2}
                              placeholder={isAr ? 'تفاصيل إضافية عن البلاغ...' : 'Additional details...'}
                              value={reportDetails}
                              onChange={(e) => setReportDetails(e.target.value)}
                              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                              >
                                {isAr ? 'تأكيد البلاغ' : 'Submit Report'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowReportForm(false)}
                                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

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
