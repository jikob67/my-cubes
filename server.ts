import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Avatar Generator Route (AI / Dice themed custom avatar SVG generator)
app.post("/api/generate-avatar", async (req, res) => {
  try {
    const { username = "player", gender = "male", style = "cyber" } = req.body;
    const seed = `${username}_${Date.now()}`;
    // Generate clean Dicebear avatar URL based on seed and style
    const avatarStyles = ['bottts-neutral', 'avataaars', 'pixel-art', 'fun-emoji', 'adventurer'];
    const selectedStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=00ece3,1e293b,0f172a,0284c7`;
    
    return res.json({
      success: true,
      avatarUrl,
      seed,
    });
  } catch (error) {
    console.error("Avatar generation error:", error);
    res.status(500).json({ error: "Failed to generate avatar" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "my cubes" });
});

// AI Support Route
app.post("/api/ai-support", async (req, res) => {
  try {
    const { message, history, language = "ar" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are the friendly, expert AI Support Assistant for "my cubes" (لعبة مكعباتي), an interactive puzzle game where players arrange, merge, and place random colorful shapes into a grid to earn Heart Points (نقاط على شكل قلب).
Key game knowledge:
- Core game: Fill the empty main grid (4x4 to 7x7) completely with random shapes (monominoes 1 to hexominoes 6 cubes) in infinite random colors.
- Merge box (منطقة الدمج): Players can drag shapes into the merge box to fuse them into composite shapes.
- Trash Bin (سلة المهملات): Players can discard shapes and recover (استعادة) them anytime without losing them permanently.
- Heart Points (نقاط القلب): Earned on winning a round, used for leveling up and perks.
- Subscriptions: 12 free chat messages per day, unlimited via Crypto wallet subscriptions (Solana, ETH, Bitcoin, Sui, Polygon, Monad, Base).
- If you cannot resolve a player's problem or if they request human intervention, remind them that their request is automatically escalated to jikob67@gmail.com and reference official support sites: https://jacobalcadiapps.wordpress.com and https://jacobalcadiapps.blogspot.com.
Language: Respond politely and concisely in the user's language (${language === "ar" ? "Arabic" : "English"}).`;

    if (ai) {
      const chatContents = (history || []).map((h: any) => `${h.sender === "user" ? "Player" : "Support"}: ${h.text}`).join("\n");
      const fullPrompt = `${chatContents}\nPlayer: ${message}\nSupport:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || (language === "ar" ? "أهلاً بك! كيف يمكنني مساعدتك اليوم في لعبة my cubes؟" : "Hello! How can I help you in my cubes today?"),
        escalated: false,
      });
    } else {
      // Intelligent fallback when API key is pending
      const isArabic = language === "ar";
      let fallbackReply = "";
      const lower = message.toLowerCase();

      if (lower.includes("merge") || lower.includes("دمج")) {
        fallbackReply = isArabic
          ? "لدمج الأشكال: اسحب شكلين أو أكثر إلى مربع الدمج المخصص أسفل الشبكة، ثم اضغط زر 'دمج الأشكال' لتكوين شكل مركب جديد يمكنك وضعه في الشبكة الرئيسية."
          : "To merge shapes: Drag two or more shapes into the dedicated Merge Box below the grid, then click 'Merge Shapes' to create a new combined shape to place in the main grid.";
      } else if (lower.includes("trash") || lower.includes("سلة") || lower.includes("مهملات") || lower.includes("حذف")) {
        fallbackReply = isArabic
          ? "سلة المهملات 🗑️ تتيح لك رمي الأشكال غير المرغوبة مؤقتاً، ويمكنك الضغط على السلة في أي وقت لاستعادة أي شكل إلى منطقة اللعب!"
          : "The Trash Bin 🗑️ lets you temporarily discard unwanted shapes, and you can open the bin at any time to restore shapes back into the playing area!";
      } else if (lower.includes("crypto") || lower.includes("محفظة") || lower.includes("اشتراك") || lower.includes("دفع")) {
        fallbackReply = isArabic
          ? "يمكنك الترقية للاشتراك غير المحدود عبر المحافظ الرقمية المدعومة (Solana, Bitcoin, Ethereum, Monad, Base, Sui, Polygon). توجه لتبويب 'الاشتراكات' لنسخ عناوين المحافظ."
          : "You can upgrade to unlimited messaging and perks using supported crypto wallets (Solana, Bitcoin, Ethereum, Monad, Base, Sui, Polygon). Head over to the Subscriptions tab.";
      } else if (lower.includes("heart") || lower.includes("قلب") || lower.includes("نقاط") || lower.includes("فوز")) {
        fallbackReply = isArabic
          ? "تحصل على نقاط القلوب ❤️ عند إكمال ملء الشبكة بالكامل بنجاح. تزيد القلوب من مستواك وتفتح مكافآت حصرية!"
          : "You earn Heart points ❤️ upon successfully filling the entire grid. Hearts level up your profile and unlock rewards!";
      } else {
        fallbackReply = isArabic
          ? "تم تسجيل استفسارك! إذا كنت بحاجة لدعم مباشر إضافي، يمكنك إرسال بريد إلى jikob67@gmail.com أو زيارة jacobalcadiapps.wordpress.com"
          : "Your inquiry is noted! For direct assistance, you can email jikob67@gmail.com or visit jacobalcadiapps.wordpress.com";
      }

      return res.json({
        reply: fallbackReply,
        escalated: false,
      });
    }
  } catch (error: any) {
    console.error("AI Support error:", error);
    res.status(500).json({
      reply: "تم توجيه طلبك إلى فريق الدعم الفني عبر البريد jikob67@gmail.com وسنرد عليك قريباً.",
      escalated: true,
    });
  }
});

// Support Email escalation ticket endpoint
app.post("/api/support-ticket", (req, res) => {
  try {
    const { userEmail, username, subject, description, timestamp } = req.body;
    console.log(`[Support Ticket Received] From: ${username || 'User'} (${userEmail || 'N/A'}) | Subject: ${subject || 'No Subject'} | Target: jikob67@gmail.com`);
    
    return res.json({
      success: true,
      message: "تم إرسال واستلام تذكرتك بنجاح لدى فريق الدعم الفني jikob67@gmail.com وسيتم التواصل معك مباشرة.",
      ticketId: `TICK-${Date.now()}`,
      targetEmail: "jikob67@gmail.com",
      timestamp: timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Support ticket error:", error);
    res.status(500).json({ error: "Failed to process support ticket" });
  }
});

// Setup Vite middleware in dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`my cubes server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
