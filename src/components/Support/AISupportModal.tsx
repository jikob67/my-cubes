import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { UserProfile } from '../../types';

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

export const AISupportModal: React.FC<AISupportModalProps> = ({
  currentUser,
  isAr,
}) => {
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: isAr
        ? 'أهلاً بك في الدعم الفني الذكي للعبة my cubes! أنا هنا لمساعدتك فوراً في أي استفسار حول قواعد اللعبة، الدمج، سلة المهملات، أو الاشتراكات. كما يمكنك إرسال بريد مباشر إلى jikob67@gmail.com عبر Gmail بنقرة واحدة أدناه.'
        : 'Welcome to my cubes AI Smart Support! I am here to help you immediately with gameplay rules, shape fusion, trash bin recovery, or crypto subscriptions. You can also send an instant Gmail message to jikob67@gmail.com below.',
      timestamp: 'الآن',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [directSubject, setDirectSubject] = useState('');
  const [directBody, setDirectBody] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
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

      const data = await res.json();

      const aiMsg: SupportChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || (isAr ? 'عذراً، حدث خطأ مؤقت. يمكنك مراسلتنا فوراً عبر jikob67@gmail.com' : 'Temporary error. You can email jikob67@gmail.com'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escalated: data.escalated,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: isAr
            ? 'تعذر الاتصال بالخادم. يمكنك إرسال رسالتك مباشرة إلى البريد الإلكتروني: jikob67@gmail.com'
            : 'Could not reach AI server. Please send directly to: jikob67@gmail.com',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          escalated: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Instant Gmail Dispatcher Link
  const getGmailDirectUrl = (subject: string, body: string) => {
    const targetEmail = 'jikob67@gmail.com';
    const sub = encodeURIComponent(subject || `[my cubes Support] Inquiry from ${currentUser?.username || 'Player'}`);
    const b = encodeURIComponent(
      body ||
        `User: ${currentUser?.fullName || 'Player'} (@${currentUser?.username || 'Guest'})\nEmail: ${currentUser?.email || 'N/A'}\nLocation: ${currentUser?.location || 'N/A'}\n\nMessage Details:\n`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${sub}&body=${b}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      
      {/* Support Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00ECE3]/20 flex items-center justify-center text-[#00a8a1] dark:text-[#00ECE3]">
              <Bot className="w-5 h-5" />
            </div>
            <span>{isAr ? 'الدعم الفني والمساعد الذكي 🤖' : 'AI Technical Support 🤖'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr 
              ? 'إجابات فورية ذكية مع إمكانية المراسلة الفورية المباشرة إلى البريد: jikob67@gmail.com' 
              : 'Smart answers with instant one-click Gmail dispatch to: jikob67@gmail.com'}
          </p>
        </div>

        {/* Instant Gmail Button */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={getGmailDirectUrl('استفسار ودعم فني عاجل - my cubes', 'السلام عليكم، أود الاستفسار بخصوص...')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>{isAr ? 'مراسلة فورية عبر Gmail' : 'Send via Gmail'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* INSTANT DIRECT EMAIL DISPATCH BOX TO jikob67@gmail.com */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-red-500/10 via-slate-900/40 to-slate-900/90 border border-red-500/30 shadow-lg text-slate-200">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{isAr ? 'إرسال تذكرة بريدية مباشرة وفورية إلى:' : 'Direct Instant Email to:'}</span>
                <span className="font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 text-xs">
                  jikob67@gmail.com
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'سيتم فتح واجهة بريدك في Gmail مباشرة مع كافة بيانات حسابك لإرسال التذكرة فوراً.' : 'Opens Gmail composer directly with your profile context.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder={isAr ? 'عنوان الرسالة أو المشكلة...' : 'Inquiry subject...'}
            value={directSubject}
            onChange={(e) => setDirectSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white outline-none focus:ring-1 focus:ring-red-400"
          />
          <input
            type="text"
            placeholder={isAr ? 'تفاصيل الاستفسار أو المشكلة...' : 'Message details...'}
            value={directBody}
            onChange={(e) => setDirectBody(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'المرسل المسجل: ' : 'Sender: '}</span>
            <span className="text-slate-200 font-mono font-bold">
              {currentUser ? `${currentUser.fullName} (${currentUser.email})` : (isAr ? 'زائر' : 'Guest')}
            </span>
          </div>

          <a
            href={getGmailDirectUrl(
              directSubject || (isAr ? `استفسار من ${currentUser?.fullName || 'لاعب'}` : `Support request`),
              directBody || (isAr ? 'أود الحصول على مساعدة بخصوص...' : 'I need support with...')
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isAr ? 'إرسال فوري إلى jikob67@gmail.com عبر Gmail' : 'Send to jikob67@gmail.com via Gmail'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Official Blogs Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-bold text-slate-600 dark:text-slate-400">
          {isAr ? 'المواقع والمدونات الرسمية:' : 'Official Blogs & Help:'}
        </span>
        <a
          href="https://jacobalcadiapps.wordpress.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#00a8a1] dark:text-[#00ECE3] hover:underline font-bold"
        >
          <span>WordPress Support</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <span>•</span>
        <a
          href="https://jacobalcadiapps.blogspot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#00a8a1] dark:text-[#00ECE3] hover:underline font-bold"
        >
          <span>Blogger Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Live AI Interactive Chat Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[480px]">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              {isAr ? 'المساعد الفني الذكي المباشر' : 'Live Smart Assistant'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">my cubes Engine 2.0</span>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#00ECE3] text-slate-950 font-medium rounded-br-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`text-[9px] mt-1 block ${
                    msg.sender === 'user' ? 'text-slate-800 text-left' : 'text-slate-400 text-right'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-[#00ECE3] animate-spin" />
                <span>{isAr ? 'المساعد الذكي يقوم بالرد وتنسيق طلبك...' : 'AI is formulating response...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={isAr ? 'اسأل المساعد الذكي عن أي استفسار أو مشكلة...' : 'Ask AI support anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00ECE3]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#00ECE3] hover:bg-[#00c9c2] text-slate-950 disabled:opacity-50 transition-all font-bold"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

      </div>

    </div>
  );
};
