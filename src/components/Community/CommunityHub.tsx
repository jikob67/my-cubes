import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Send, 
  Heart, 
  Sparkles, 
  X,
  Lock,
  Coins,
  Upload,
  Play,
  Maximize2,
  Trophy,
  Mic,
  Film,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { 
  UserProfile, 
  ChatMessage 
} from '../../types';
import { sounds } from '../../utils/sound';

interface CommunityHubProps {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  publicMessages: ChatMessage[];
  onSendPublicMessage: (text: string, mediaType?: 'image' | 'video' | 'audio' | 'result', mediaUrl?: string) => void;
  privateChats: Record<string, ChatMessage[]>;
  onSendPrivateMessage: (targetUserId: string, text: string, mediaType?: 'image' | 'video' | 'audio' | 'result', mediaUrl?: string) => void;
  onOpenProfileForUser: (user: UserProfile) => void;
  onOpenSubscriptions: () => void;
  isAr: boolean;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  currentUser,
  allUsers,
  publicMessages,
  onSendPublicMessage,
  privateChats,
  onSendPrivateMessage,
  onOpenProfileForUser,
  onOpenSubscriptions,
  isAr,
}) => {
  const [subTab, setSubTab] = useState<'public_chat' | 'private_chat'>('public_chat');
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<UserProfile | null>(
    allUsers.find((u) => u.id !== currentUser?.id) || null
  );

  // Chat message input state
  const [chatInput, setChatInput] = useState('');
  const [activeMediaType, setActiveMediaType] = useState<'text' | 'image' | 'video' | 'audio' | 'result'>('text');
  const [attachedMediaUrl, setAttachedMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');

  // Media Modal state (Image/Video Lightbox)
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string } | null>(null);

  // Quick Media Attachment Dialog state
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachType, setAttachType] = useState<'image' | 'video' | 'result'>('image');
  const [attachUrlInput, setAttachUrlInput] = useState('');
  const [attachTitleInput, setAttachTitleInput] = useState('');
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Media filter inside current chat
  const [chatFilter, setChatFilter] = useState<'all' | 'media' | 'results'>('all');

  const currentMessages = subTab === 'public_chat' 
    ? publicMessages 
    : (selectedPrivateUser ? privateChats[selectedPrivateUser.id] || [] : []);

  const filteredMessages = currentMessages.filter((msg) => {
    if (chatFilter === 'media') {
      return msg.mediaType === 'image' || msg.mediaType === 'video';
    }
    if (chatFilter === 'results') {
      return msg.mediaType === 'result';
    }
    return true;
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!chatInput.trim() && !attachedMediaUrl && activeMediaType !== 'result') return;

    if (!currentUser.isVip && currentUser.freeMessagesRemaining <= 0) {
      alert(isAr ? 'لقد استنفدت 12 رسالة مجانية لهذا اليوم! يرجى الاشتراك عبر المحافظ الرقمية للمزيد.' : 'You have reached your 12 free daily messages! Please subscribe via crypto to continue.');
      onOpenSubscriptions();
      return;
    }

    const payloadText = chatInput.trim() || mediaCaption.trim() || (
      activeMediaType === 'image' ? (isAr ? 'شارك صورة جديدة' : 'Shared a photo') :
      activeMediaType === 'video' ? (isAr ? 'شارك مقطع فيديو وتحدي' : 'Shared a challenge video') :
      activeMediaType === 'result' ? (isAr ? 'شارك نتيجة جولة جديدة 🏆' : 'Shared game score 🏆') : ''
    );

    const mType = activeMediaType !== 'text' ? activeMediaType : undefined;
    const mUrl = attachedMediaUrl || undefined;

    if (subTab === 'public_chat') {
      onSendPublicMessage(payloadText, mType, mUrl);
    } else if (subTab === 'private_chat' && selectedPrivateUser) {
      onSendPrivateMessage(selectedPrivateUser.id, payloadText, mType, mUrl);
    }

    sounds.playPlace();
    setChatInput('');
    setAttachedMediaUrl('');
    setMediaCaption('');
    setActiveMediaType('text');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedMediaUrl(base64);
      setActiveMediaType('image');
      setIsAttachModalOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use object URL or base64
    const blobUrl = URL.createObjectURL(file);
    setAttachedMediaUrl(blobUrl);
    setActiveMediaType('video');
    setIsAttachModalOpen(false);

    // Also attempt base64 conversion for persistence if file is reasonable size (< 25MB)
    if (file.size < 25 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAttachedMediaUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleApplyAttachModal = () => {
    if (!attachUrlInput.trim() && attachType !== 'result') {
      alert(isAr ? 'يرجى إدخال رابط صالح للصورة أو الفيديو أو اختيار ملف من جهازك' : 'Please enter a valid URL or select a file from your device');
      return;
    }
    setAttachedMediaUrl(attachUrlInput.trim());
    setActiveMediaType(attachType);
    if (attachTitleInput.trim()) {
      setChatInput(attachTitleInput.trim());
    }
    setIsAttachModalOpen(false);
    setAttachUrlInput('');
    setAttachTitleInput('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Community Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00ECE3] animate-pulse"></span>
            {isAr ? 'مجتمع اللاعبين والمحادثات والوسائط 🎮' : 'Players Community, Chat & Media 🎮'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isAr ? 'تواصل فوري، شارك صور وفيديوهات نتائجك وتحدياتك مباشرة في الدردشة العامة والخاصة' : 'Chat in real-time, share result clips, photos & challenge cards in public & private chats'}
          </p>
        </div>

        {/* Daily Messages Quota Badge */}
        {currentUser && (
          <div 
            onClick={onOpenSubscriptions}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#00ECE3]/40 cursor-pointer hover:scale-102 transition-transform shadow-xs"
            title={isAr ? 'الترقية للمزيد من الرسائل' : 'Upgrade for more messages'}
          >
            <Coins className="w-4 h-4 text-[#00a8a1] dark:text-[#00ECE3]" />
            <div className="text-left rtl:text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                {isAr ? 'الرسائل اليومية المتبقية' : 'Daily Free Messages'}
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {currentUser.isVip ? (isAr ? 'غير محدود (VIP) ✨' : 'Unlimited (VIP) ✨') : `${currentUser.freeMessagesRemaining} / 12`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sub Tabs Selector: Public Chat & Private Chat */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4">
        <div className="flex items-center gap-2">
          <button
            id="subtab-public-chat"
            onClick={() => {
              sounds.playClick();
              setSubTab('public_chat');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              subTab === 'public_chat'
                ? 'bg-[#00ECE3] text-slate-950 shadow-md shadow-[#00ECE3]/20 ring-2 ring-[#00ECE3]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isAr ? 'الدردشة العامة والوسائط 🌐' : 'Public Chat & Media 🌐'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-black">
              {publicMessages.length}
            </span>
          </button>

          <button
            id="subtab-private-chat"
            onClick={() => {
              sounds.playClick();
              setSubTab('private_chat');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              subTab === 'private_chat'
                ? 'bg-[#00ECE3] text-slate-950 shadow-md shadow-[#00ECE3]/20 ring-2 ring-[#00ECE3]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'الدردشة الخاصة والوسائط 🔒' : 'Private Chat & Media 🔒'}</span>
          </button>
        </div>

        {/* Media Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          {(
            [
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              { id: 'media', labelAr: 'الصور والفيديوهات', labelEn: 'Photos & Videos' },
              { id: 'results', labelAr: 'النتائج 🏆', labelEn: 'Scores' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setChatFilter(f.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                chatFilter === f.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Integrated Chat & Multimedia Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm min-h-[580px]">
        
        {/* Private Chat: Player selection list */}
        {subTab === 'private_chat' && (
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-slate-200 dark:border-slate-800 pb-4 lg:pb-0 lg:pr-4 rtl:lg:pr-0 rtl:lg:pl-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isAr ? 'اللاعبون المتاحون' : 'Online Players'}
              </h3>
              <span className="text-[10px] text-[#00a8a1] dark:text-[#00ECE3] font-bold">
                {allUsers.filter((u) => u.id !== currentUser?.id).length} {isAr ? 'لاعب' : 'players'}
              </span>
            </div>

            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[480px] pr-1">
              {allUsers
                .filter((u) => u.id !== currentUser?.id)
                .map((player) => {
                  const isSelected = selectedPrivateUser?.id === player.id;
                  const unreadPlayerMsgs = (privateChats[player.id] || []).length;
                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedPrivateUser(player);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl text-left rtl:text-right transition-all w-full shrink-0 lg:shrink ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border border-[#00ECE3] shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={player.avatar}
                          alt={player.username}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block truncate">
                            {player.fullName}
                          </span>
                          {unreadPlayerMsgs > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00ECE3] text-slate-950 font-black">
                              {unreadPlayerMsgs}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          @{player.username} • {player.hearts} ❤️
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Chat Stream & Multimedia Feed */}
        <div className={`${subTab === 'private_chat' ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col justify-between h-[520px]`}>
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            {subTab === 'private_chat' && selectedPrivateUser ? (
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => onOpenProfileForUser(selectedPrivateUser)}
              >
                <img
                  src={selectedPrivateUser.avatar}
                  alt={selectedPrivateUser.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00ECE3]"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {selectedPrivateUser.fullName}
                    <span className="text-[10px] font-mono text-slate-400 font-normal">@{selectedPrivateUser.username}</span>
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {isAr ? 'محادثة خاصة مشفرة 🔒' : 'End-to-end Private Chat 🔒'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00ECE3]"></div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {isAr ? 'غرفة المحادثة العامة ومشاركة الوسائط' : 'Public Room & Media Sharing'}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'يمكن لجميع اللاعبين رؤية الصور، الفيديوهات، والنتائج ومناقشتها' : 'All players can view photos, video clips, and game scores'}
                  </span>
                </div>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              {/* Direct Image Picker button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  imageFileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-[#00a8a1] dark:text-[#00ECE3] hover:bg-[#00ECE3] hover:text-slate-950 text-xs font-black transition-all shadow-xs"
                title={isAr ? 'فتح واختيار صورة من جهازك' : 'Open photo from device'}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'صورة' : 'Photo'}</span>
              </button>

              {/* Direct Video Picker button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  videoFileInputRef.current?.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500 hover:text-white text-xs font-black transition-all shadow-xs"
                title={isAr ? 'فتح واختيار فيديو وتحدي من جهازك' : 'Open video challenge from device'}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'فيديو وتحدي' : 'Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMediaType('result');
                  setChatInput(isAr ? 'حققت نتيجة رائعة في اللعبة! 🏆' : 'Scored a great round in my cubes! 🏆');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500 hover:text-white text-xs font-bold transition-all"
                title={isAr ? 'مشاركة بطاقة النتيجة' : 'Share Score Card'}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'النتيجة' : 'Score'}</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <MessageSquare className="w-6 h-6 opacity-30" />
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {isAr ? 'لا توجد رسائل أو وسائط حالياً' : 'No messages or media yet'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {isAr ? 'ابدأ المحادثة أو شارك أول صورة وفيديو نتيجة!' : 'Start the conversation or share your first clip/photo!'}
                </span>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} group`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <div className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-3.5 ${
                      isMine
                        ? 'bg-[#00ECE3] text-slate-950 rounded-tr-xs shadow-md shadow-[#00ECE3]/15'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className={`text-[10px] font-black ${isMine ? 'text-slate-800' : 'text-slate-400'}`}>
                          {msg.senderName}
                        </span>
                        <span className={`text-[9px] ${isMine ? 'text-slate-700' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Text content */}
                      {msg.content && (
                        <p className="text-xs sm:text-sm font-medium leading-relaxed break-words mb-1.5">
                          {msg.content}
                        </p>
                      )}

                      {/* 1. PHOTO ATTACHMENT RENDERING */}
                      {msg.mediaType === 'image' && msg.mediaUrl && (
                        <div className="mt-2 rounded-2xl overflow-hidden border border-black/10 relative group/img cursor-pointer bg-slate-950"
                          onClick={() => setLightboxMedia({ url: msg.mediaUrl!, type: 'image', title: msg.content })}
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Attached Game Photo"
                            className="w-full max-h-64 object-contain hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
                            <ImageIcon className="w-3 h-3 text-[#00ECE3]" />
                            <span>{isAr ? 'صورة نتيجة' : 'Game Photo'}</span>
                          </div>
                        </div>
                      )}

                      {/* 2. VIDEO ATTACHMENT RENDERING (Direct Native HTML5 Player) */}
                      {msg.mediaType === 'video' && msg.mediaUrl && (
                        <div className="mt-2 rounded-2xl overflow-hidden border border-black/20 relative group/vid bg-black flex flex-col items-center">
                          <video 
                            src={msg.mediaUrl} 
                            controls 
                            playsInline
                            preload="metadata"
                            className="w-full max-h-72 rounded-2xl bg-black object-contain"
                          />
                          <div className="w-full px-3 py-1.5 bg-black/60 flex items-center justify-between text-[10px] text-white">
                            <span className="flex items-center gap-1 font-bold">
                              <VideoIcon className="w-3 h-3 text-[#00ECE3]" />
                              {isAr ? 'مقطع فيديو وتحدي' : 'Challenge Video'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLightboxMedia({ url: msg.mediaUrl!, type: 'video', title: msg.content })}
                              className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-[#00ECE3] hover:text-slate-950 font-bold transition-colors flex items-center gap-1"
                            >
                              <Maximize2 className="w-3 h-3" />
                              {isAr ? 'تكبير' : 'Fullscreen'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. GAME RESULT CARD ATTACHMENT */}
                      {msg.mediaType === 'result' && msg.resultData && (
                        <div className="mt-2 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-black/10 flex items-center justify-between text-xs shadow-inner">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-white block">
                                {msg.resultData.score} {isAr ? 'نقطة' : 'Pts'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">
                                {isAr ? `شبكة ${msg.resultData.gridSize}×${msg.resultData.gridSize}` : `Grid ${msg.resultData.gridSize}x${msg.resultData.gridSize}`}
                              </span>
                            </div>
                          </div>

                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black border border-rose-200 dark:border-rose-900">
                            <Heart className="w-3.5 h-3.5 fill-rose-600" />
                            +{msg.resultData.hearts}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Attached Media Preview Banner before sending */}
          {attachedMediaUrl && (
            <div className="mb-2 p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-[#00ECE3]/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {activeMediaType === 'image' ? (
                  <img src={attachedMediaUrl} alt="Attached" className="w-12 h-12 rounded-lg object-cover ring-1 ring-[#00ECE3]" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-black text-[#00ECE3] flex items-center justify-center ring-1 ring-purple-500 shrink-0">
                    <VideoIcon className="w-6 h-6 animate-pulse" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate">
                    {activeMediaType === 'image' ? (isAr ? 'تم اختيار صورة جاهزة للإرسال' : 'Photo ready to send') : (isAr ? 'تم اختيار فيديو وتحدي جاهز للإرسال' : 'Challenge video ready to send')}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {isAr ? 'جاهز للمشاركة مع باقي اللاعبين' : 'Ready to share with community'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAttachedMediaUrl('');
                  setActiveMediaType('text');
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 bg-slate-200/50 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar with multimedia action triggers */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            
            {/* Dedicated hidden file inputs for Photos and Videos */}
            <input 
              type="file" 
              ref={imageFileInputRef} 
              onChange={handleImageFileChange} 
              accept="image/png,image/jpeg,image/webp,image/gif,image/*" 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={videoFileInputRef} 
              onChange={handleVideoFileChange} 
              accept="video/mp4,video/quicktime,video/webm,video/mkv,video/avi,video/*" 
              className="hidden" 
            />

            {/* Quick Media Attach Menu button */}
            <button
              type="button"
              onClick={() => setIsAttachModalOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#00ECE3] hover:text-slate-950 transition-all"
              title={isAr ? 'خيارات إرفاق الوسائط والروابط' : 'Media attach options'}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Direct Device Gallery Trigger */}
            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#00ECE3] hover:text-slate-950 transition-all hidden sm:flex"
              title={isAr ? 'اختيار صورة مباشرة من جهازك' : 'Choose photo from device'}
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Message input */}
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                !currentUser
                  ? (isAr ? 'سجل الدخول للمشاركة في الدردشة...' : 'Login to chat...')
                  : (isAr ? 'اكتب رسالتك أو شارك صور وفيديوهات نتائجك...' : 'Type a message or share photo/video...')
              }
              disabled={!currentUser}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00ECE3]"
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!currentUser || (!chatInput.trim() && !attachedMediaUrl && activeMediaType !== 'result')}
              className="p-2.5 px-4 rounded-2xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 font-black shadow-md shadow-[#00ECE3]/20 disabled:opacity-40 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{isAr ? 'إرسال' : 'Send'}</span>
            </button>
          </form>

        </div>

      </div>

      {/* ATTACH MEDIA DIALOG (Photos, Videos, Results) */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#00ECE3]" />
                {isAr ? 'إرفاق وسائط في المحادثة' : 'Attach Media to Chat'}
              </h3>
              <button onClick={() => setIsAttachModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttachType('image')}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border transition-all ${
                    attachType === 'image'
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-[#00ECE3] text-[#00a8a1] dark:text-[#00ECE3]'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-bold">{isAr ? 'صورة' : 'Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachType('video')}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border transition-all ${
                    attachType === 'video'
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-600 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <VideoIcon className="w-5 h-5" />
                  <span className="text-xs font-bold">{isAr ? 'فيديو وتحدي' : 'Video Clip'}</span>
                </button>
              </div>

              {/* Upload from device option */}
              <div 
                onClick={() => {
                  if (attachType === 'video') {
                    videoFileInputRef.current?.click();
                  } else {
                    imageFileInputRef.current?.click();
                  }
                }}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00ECE3] bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-[#00ECE3] mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {attachType === 'video' 
                    ? (isAr ? 'انقر لاختيار مقطع فيديو وتحدي من جهازك' : 'Click to select video from your device')
                    : (isAr ? 'انقر لاختيار صورة من جهازك' : 'Click to select photo from your device')}
                </span>
                <span className="text-[10px] text-slate-400">
                  {attachType === 'video' 
                    ? (isAr ? 'يدعم MP4, MOV, WEBM, MKV' : 'Supports MP4, MOV, WEBM, MKV')
                    : (isAr ? 'يدعم PNG, JPG, WEBP, GIF' : 'Supports PNG, JPG, WEBP, GIF')}
                </span>
              </div>

              {/* Or Paste URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'أو الصق رابط الوسائط (URL):' : 'Or paste media URL:'}
                </label>
                <input
                  type="url"
                  placeholder={attachType === 'image' ? 'https://images.unsplash.com/...' : 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  value={attachUrlInput}
                  onChange={(e) => setAttachUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              {/* Optional Caption */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'عنوان أو تعليق مصاحب:' : 'Caption / message:'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: فوز بجولة صعبة وتحدي جديد!' : 'e.g. Cleared hard mode round!'}
                  value={attachTitleInput}
                  onChange={(e) => setAttachTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00ECE3] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleApplyAttachModal}
                  className="px-5 py-2 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 text-xs font-black shadow-md shadow-[#00ECE3]/20"
                >
                  {isAr ? 'تأكيد الإرفاق' : 'Attach to Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR FULL-SIZE PHOTOS & VIDEOS */}
      {lightboxMedia && (
        <div 
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[80%]">
                {lightboxMedia.title || (isAr ? 'معاينة الوسائط' : 'Media Preview')}
              </span>
              <button
                onClick={() => setLightboxMedia(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 flex items-center justify-center bg-black min-h-[320px] max-h-[75vh]">
              {lightboxMedia.type === 'image' ? (
                <img 
                  src={lightboxMedia.url} 
                  alt="Full size preview" 
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
                />
              ) : (
                <video 
                  src={lightboxMedia.url} 
                  controls 
                  autoPlay 
                  className="max-h-[70vh] w-full rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
