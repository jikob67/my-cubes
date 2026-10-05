import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ArrowUpRight,
  HelpCircle,
  FileQuestion,
  RefreshCw,
  Clock,
  Layers,
  Inbox
} from 'lucide-react';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/sound';

interface AISupportModalProps {
  currentUser: UserProfile | null;
  isAr: boolean;
}

interface SupportChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  escalated?: boolean;
}

interface SubmittedTicket {
  ticketId: string;
  subject: string;
  description: string;
  timestamp: string;
  status: 'received' | 'in_review';
}

export const AISupportModal: React.FC<AISupportModalProps> = ({
  currentUser,
  isAr,
}) => {
  const TARGET_SUPPORT_EMAIL = 'jikob67@gmail.com';

  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: isAr
        ? 'مرحباً بك في مركز الدعم الفني الذكي للعبة my cubes! أنا المساعد الذكي، جاهز للإجابة على جميع أسئلتك حول اللعبة، أو مساعدتك في رفع تذكرة مباشرة إلى الإدارة عبر البريد الإلكتروني.'
        : 'Welcome to my cubes Smart Support Center! I am your AI assistant, ready to assist you with all gameplay questions or submit a direct ticket to support via email.',
      timestamp: 'الآن',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct Ticket & Email Dispatch state
  const [directSubject, setDirectSubject] = useState('');
  const [directBody, setDirectBody] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<SubmittedTicket | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);
  const [portalNotice, setPortalNotice] = useState<string | null>(null);

  // Helper to open external links safely across iframes and browsers
  const handleOpenExternal = (url: string, name: string) => {
    sounds.playClick();
    try {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.href = url;
      }
    } catch {
      window.open(url, '_blank');
    }
    setPortalNotice(isAr ? `تم فتح ${name}` : `Opened ${name}`);
    setTimeout(() => setPortalNotice(null), 3000);
  };

  // Helper for generating intelligent fallback replies instantly
  const quickQuestions = isAr ? [
    { title: 'كيف أدمج الأشكال؟', prompt: 'كيف أقوم بدمج الأشكال في منطقة الدمج؟' },
    { title: 'كيف أستعيد شكلاً من السلة؟', prompt: 'كيف يمكنني استعادة شكل حذفته في سلة المهملات؟' },
    { title: 'طرق الاشتراك بالمحافظ', prompt: 'ما هي طرق الاشتراك المتاحة بالمحافظ الرقمية؟' },
    { title: 'كيفية فتح المراحل الجديدة', prompt: 'كيف أنتقل للمراحل التالية بعد شبكة 4×4؟' },
  ] : [
    { title: 'How to merge shapes?', prompt: 'How do I merge shapes in the merge zone?' },
    { title: 'How to restore from trash?', prompt: 'How do I restore a shape from the trash bin?' },
    { title: 'Crypto subscriptions info', prompt: 'What crypto wallets are supported for subscriptions?' },
    { title: 'Unlocking next stages', prompt: 'How do I unlock stages after 4x4?' },
  ];

  // Helper for generating intelligent fallback replies instantly
  const getSmartFallbackReply = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('merge') || lower.includes('دمج')) {
      return isAr
        ? 'لدمج الأشكال: اسحب شكلين أو أكثر وضعهم في صندوق الدمج المخصص أسفل الشبكة، ثم اضغط على زر "دمج الأشكال" للحصول على شكل مركب جديد يمكنك استخدامه في الشبكة!'
        : 'To merge shapes: Drag two or more shapes into the dedicated Merge Box below the board, then click "Merge Shapes" to generate a composite new shape!';
    }
    if (lower.includes('trash') || lower.includes('سلة') || lower.includes('مهملات') || lower.includes('حذف')) {
      return isAr
        ? 'سلة المهملات تتيح لك التخلص المؤقت من أي شكل لا يناسبك، وبالنقر على السلة يمكنك استعادة أي شكل تريده فوراً إلى منطقة اللعب دون فقدانه.'
        : 'The Trash Bin allows temporary storage of shapes. Click the trash bin anytime to restore discarded pieces back into play.';
    }
    if (lower.includes('مرحلة') || lower.includes('مراحل') || lower.includes('فتح') || lower.includes('stage') || lower.includes('level') || lower.includes('grid')) {
      return isAr
        ? 'نظام المراحل يعتمد على التدرج الإجباري: تبدأ من 4×4 وبمجرد إنهاء جميع الأشكال المتاحة في المرحلة تكتمل ويتم فتح الشبكة التالية تلقائياً حتى 20×20!'
        : 'Stage progression is strictly sequential: start at 4x4, finish all available shapes to complete the stage and unlock the next grid size up to 20x20!';
    }
    if (lower.includes('crypto') || lower.includes('محفظة') || lower.includes('اشتراك') || lower.includes('solana') || lower.includes('vip')) {
      return isAr
        ? 'الاشتراكات تدعم المحافظ الرقمية الكبرى (Solana, Base, Monad, Bitcoin, Ethereum, Sui, Polygon) لتفعيل الرسائل غير المحدودة والميزات المتقدمة عبر تبويب الاشتراكات.'
        : 'Subscriptions support major crypto networks (Solana, Base, Monad, Bitcoin, Ethereum, Sui, Polygon) for unlimited messages & VIP perks in the Subscriptions tab.';
    }
    if (lower.includes('heart') || lower.includes('قلب') || lower.includes('نقاط')) {
      return isAr
        ? 'نقاط القلوب تُمنح عند إكمال وتجاوز الجولات والصفوف، ويمكنك استبدالها أيضاً بترقيات اشتراك مجانية أو رفع مستواك في المنصة.'
        : 'Heart points are earned upon completing rounds and lines, and can be redeemed for VIP perks or leveling up your player profile.';
    }
    return isAr
      ? `شكراً لتواصلك! تم استلام رسالتك وتوثيقها. للإجابة المباشرة أو الإبلاغ عن مشكلة فنية، يمكنك أيضاً إرسال بريد فوري إلى ${TARGET_SUPPORT_EMAIL} باستخدام الأزرار أدناه.`
      : `Thank you for your message! If you need direct administrative support, you can also dispatch an instant email to ${TARGET_SUPPORT_EMAIL} below.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    sounds.playClick();
    setInput('');
    const userMsg: SupportChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages,
          language: isAr ? 'ar' : 'en',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: SupportChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.reply || getSmartFallbackReply(userText),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          escalated: data.escalated,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Server response error');
      }
    } catch (err) {
      console.warn('Using client-side smart support fallback:', err);
      // Guarantee instant, reliable response even if network/server is offline
      setTimeout(() => {
        const aiMsg: SupportChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: getSmartFallbackReply(userText),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          escalated: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  // Submit direct support ticket to backend & automatically open Gmail pre-filled
  const handleDirectTicketSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const subject = directSubject.trim() || (isAr ? 'طلب دعم فني واستفسار عام' : 'General Support Inquiry');
    const body = directBody.trim() || (isAr ? 'أحتاج إلى مساعدة ومتابعة بخصوص حسابي ولعبة my cubes.' : 'I need assistance regarding my account and my cubes gameplay.');

    setTicketSending(true);
    sounds.playClick();

    // 1. Automatically launch Gmail with properly formatted fields
    const gmailUrl = getGmailWebUrl(subject, body);
    try {
      const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = gmailUrl;
      }
    } catch {
      window.open(gmailUrl, '_blank');
    }

    // 2. Also register ticket in backend database for tracking & history
    try {
      const res = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser?.email || 'Guest',
          username: currentUser?.username || 'Guest',
          subject,
          description: body,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      const ticket: SubmittedTicket = {
        ticketId: data.ticketId || `TICK-${Date.now().toString().slice(-6)}`,
        subject,
        description: body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'received',
      };

      setTicketSuccess(ticket);
      sounds.playSuccess();
      setPortalNotice(isAr ? 'تم فتح Gmail وتوثيق التذكرة بنجاح!' : 'Gmail opened and ticket registered successfully!');
      setTimeout(() => setPortalNotice(null), 5000);
    } catch (err) {
      console.error('Ticket network error, creating local verified ticket:', err);
      const ticket: SubmittedTicket = {
        ticketId: `TICK-${Date.now().toString().slice(-6)}`,
        subject,
        description: body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'received',
      };
      setTicketSuccess(ticket);
      sounds.playSuccess();
      setPortalNotice(isAr ? 'تم فتح Gmail بنجاح وتجهيز الرسالة!' : 'Gmail opened and message prepared!');
      setTimeout(() => setPortalNotice(null), 5000);
    } finally {
      setTicketSending(false);
    }
  };

  // Construct Email URL with multiple options (Web Gmail, Mobile App / Mailto)
  const getGmailWebUrl = (subject: string, body: string) => {
    const sub = encodeURIComponent(
      subject.startsWith('[my cubes') ? subject : `[my cubes Support] ${subject}`
    );
    const playerInfo = [
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎮 بيانات حساب اللاعب (Player Info):`,
      `• الاسم: ${currentUser?.fullName || 'Guest'}`,
      `• اسم المستخدم: @${currentUser?.username || 'user'}`,
      `• البريد المسجل: ${currentUser?.email || 'N/A'}`,
      `• القلوب: ${currentUser?.hearts ?? 0} ❤️`,
      `• الانتصارات: ${currentUser?.wins ?? 0} 🏆`,
      `• المستوى: ${currentUser?.level ?? 1} ⭐️`,
      `• تاريخ الطلب: ${new Date().toLocaleString('ar-SA')}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📝 تفاصيل الرسالة والملاحظات:`,
      `${body}`,
      ``,
      `──────────────────────────`,
      `مرسل من تطبيق لعبة my cubes الذكية`
    ].join('\n');

    const b = encodeURIComponent(playerInfo);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${TARGET_SUPPORT_EMAIL}&su=${sub}&body=${b}`;
  };

  const handleOpenGmail = () => {
    sounds.playClick();
    const url = getGmailWebUrl(directSubject, directBody);
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = url;
      }
    } catch {
      window.open(url, '_blank');
    }
    setPortalNotice(isAr ? 'جاري فتح شاشة كتابة الرسالة في Gmail...' : 'Opening Gmail Compose window...');
    setTimeout(() => setPortalNotice(null), 3500);
  };

  const getMailtoUrl = (subject: string, body: string) => {
    const sub = encodeURIComponent(subject || `[my cubes Support] Inquiry`);
    const b = encodeURIComponent(
      `Player: ${currentUser?.fullName || 'Guest'} (@${currentUser?.username || 'user'})\nEmail: ${currentUser?.email || 'N/A'}\n\n${body || ''}`
    );
    return `mailto:${TARGET_SUPPORT_EMAIL}?subject=${sub}&body=${b}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(TARGET_SUPPORT_EMAIL);
    setCopiedEmail(true);
    sounds.playClick();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyFullContext = () => {
    const fullText = `To: ${TARGET_SUPPORT_EMAIL}\nSubject: ${directSubject || 'my cubes Support Inquiry'}\n\nPlayer: ${currentUser?.fullName || 'Guest'} (@${currentUser?.username || 'user'})\nEmail: ${currentUser?.email || 'N/A'}\nDetails: ${directBody || 'N/A'}`;
    navigator.clipboard.writeText(fullText);
    setCopiedContext(true);
    sounds.playClick();
    setTimeout(() => setCopiedContext(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Support Hero Header */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ECE3]/20 to-cyan-500/30 flex items-center justify-center text-[#00a8a1] dark:text-[#00ECE3] border border-[#00ECE3]/40 shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isAr ? 'مركز الدعم الفني والمراسلة' : 'Support & Messaging Center'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAr ? 'نشط 24/7' : 'Active 24/7'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isAr 
                  ? 'مساعد ذكي فوري متقدم + نظام تذاكر ومراسلة بريدية مباشرة وموثوقة إلى jikob67@gmail.com' 
                  : 'Instant smart AI assistance + direct reliable ticket dispatch to jikob67@gmail.com'}
              </p>
            </div>
          </div>

          {/* Quick Copy & Email Badge */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 px-2.5 py-1 text-xs">
              <Mail className="w-4 h-4 text-red-500" />
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">
                {TARGET_SUPPORT_EMAIL}
              </span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#00ECE3] hover:text-slate-950 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs border border-slate-200 dark:border-slate-600"
              title={isAr ? 'نسخ البريد الإلكتروني' : 'Copy email address'}
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN INTERACTIVE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: DIRECT GMAIL & TICKET DISPATCH SYSTEM (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-red-500/10 via-slate-900/40 to-slate-900/90 border border-red-500/30 shadow-xl text-slate-200 space-y-4">
            
            <div className="flex items-center justify-between gap-2 border-b border-red-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isAr ? 'إرسال تذكرة / بريد مباشر إلى Gmail' : 'Direct Ticket / Gmail Dispatch'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'يتم إرسالها فوراً إلى' : 'Instantly delivered to'}{' '}
                    <strong className="text-red-400 font-mono">{TARGET_SUPPORT_EMAIL}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Submission Form */}
            <form onSubmit={handleDirectTicketSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isAr ? 'عنوان المشكلة أو الاستفسار:' : 'Subject / Issue Title:'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: استفسار حول استعادة الأشكال أو الاشتراك...' : 'e.g., Question about gameplay or VIP...'}
                  value={directSubject}
                  onChange={(e) => setDirectSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isAr ? 'تفاصيل الرسالة والملاحظات:' : 'Message Details & Notes:'}
                </label>
                <textarea
                  rows={4}
                  placeholder={isAr ? 'اكتب تفاصيل طلبك أو رسالتك بالتفصيل هنا...' : 'Describe your question or issue in detail here...'}
                  value={directBody}
                  onChange={(e) => setDirectBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {currentUser ? `${currentUser.fullName} (@${currentUser.username})` : (isAr ? 'زائر' : 'Guest')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFullContext}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                >
                  {copiedContext ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedContext ? (isAr ? 'تم نسخ التقرير' : 'Copied') : (isAr ? 'نسخ التقرير' : 'Copy Text')}</span>
                </button>
              </div>

              {/* Submit & Dispatch Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                
                {/* 1. Direct In-App Ticket Submit */}
                <button
                  type="submit"
                  disabled={ticketSending}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  {ticketSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  )}
                  <span>{isAr ? 'إرسال تذكرة رسمية' : 'Submit Ticket'}</span>
                </button>

                {/* 2. Instant Open in Web Gmail */}
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-black text-xs flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-md"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>{isAr ? 'فتح في Gmail' : 'Open in Gmail'}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </button>

              </div>

              {/* 3. Native Mail Client Fallback */}
              <div className="pt-1 text-center">
                <a
                  href={getMailtoUrl(directSubject, directBody)}
                  onClick={() => sounds.playClick()}
                  className="text-[11px] text-red-400 hover:text-red-300 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>{isAr ? 'أو إرسال عبر تطبيق البريد الافتراضي على جهازك (Mail App)' : 'Or send via default device Mail App'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

            </form>

            {/* Portal Action Notice */}
            {portalNotice && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-[#00ECE3] shrink-0" />
                <span className="font-bold">{portalNotice}</span>
              </div>
            )}

            {/* Success Banner upon sending ticket */}
            {ticketSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 font-black text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تم استلام وتوثيق تذكرتك بنجاح!' : 'Ticket Received & Registered!'}</span>
                </div>
                <div className="text-[11px] text-emerald-300">
                  <span>{isAr ? 'رقم التذكرة:' : 'Ticket ID:'} </span>
                  <strong className="font-mono text-white bg-emerald-900/60 px-1.5 py-0.5 rounded">
                    #{ticketSuccess.ticketId}
                  </strong>
                </div>
                <p className="text-[10px] text-emerald-300/80">
                  {isAr 
                    ? `تم توجيه تذكرتك إلى فريق الدعم الفني ${TARGET_SUPPORT_EMAIL}، وسيتم الرد عليك في أقرب وقت.`
                    : `Your ticket has been dispatched to ${TARGET_SUPPORT_EMAIL}, we will follow up promptly.`}
                </p>
              </div>
            )}

          </div>

          {/* Official Blogs & Community Links Box */}
          <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#00a8a1] dark:text-[#00ECE3]" />
              <span>{isAr ? 'المواقع والمدونات الرسمية للمطور:' : 'Official Development Portals:'}</span>
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOpenExternal('https://jacobalcadiapps.wordpress.com', 'WordPress')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#00ECE3]/20 hover:border-[#00ECE3]/60 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-start"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#00ECE3]" />
                  <span>WordPress Official Portal</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenExternal('https://jacobalcadiapps.blogspot.com', 'Blogger')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#00ECE3]/20 hover:border-[#00ECE3]/60 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer text-start"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#00ECE3]" />
                  <span>Blogger Support News</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE AI INTERACTIVE CHAT SYSTEM (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[600px] bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
          
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
              <div>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">
                  {isAr ? 'المساعد الذكي للدعم الفني' : 'AI Support Assistant'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'استجابة فورية لكافة قواعد ومشاكل اللعبة' : 'Instant answers to any gameplay query'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setMessages([
                  {
                    id: `welcome_${Date.now()}`,
                    sender: 'ai',
                    text: isAr
                      ? 'مرحباً! تم مسح المحادثة السابقة، كيف يمكنني مساعدتك الآن؟'
                      : 'Hello! Chat history cleared, how can I assist you now?',
                    timestamp: 'الآن',
                  },
                ]);
              }}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all text-xs flex items-center gap-1 font-bold"
              title={isAr ? 'إعادة ضبط المحادثة' : 'Reset chat'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              {isAr ? 'أسئلة شائعة:' : 'Quick:'}
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-[#00ECE3] hover:text-slate-950 text-slate-600 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all"
              >
                {q.title}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#00ECE3] to-cyan-400 text-slate-950 font-bold rounded-br-none shadow-md shadow-[#00ECE3]/20'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 flex items-center gap-1 ${
                      msg.sender === 'user' ? 'text-slate-800 justify-start' : 'text-slate-400 justify-end'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-4 h-4 text-[#00ECE3] animate-spin" />
                  <span>{isAr ? 'جاري صياغة الإجابة الفورية...' : 'Formulating smart response...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isAr ? 'اسأل المساعد الذكي عن أي استفسار أو مشكلة في اللعبة...' : 'Ask the smart assistant anything about the game...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00ECE3] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[#00ECE3] hover:bg-cyan-300 text-slate-950 disabled:opacity-40 transition-all font-black shadow-md shadow-[#00ECE3]/20"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
