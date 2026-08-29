export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface Point {
  x: number;
  y: number;
}

export type ShapeSizeCategory = 1 | 2 | 3 | 4 | 5 | 6; // أحادية، ثنائية، ثلاثية، رباعية، خماسية، سداسية

export interface Shape {
  id: string;
  name: string;
  category: ShapeSizeCategory;
  matrix: number[][]; // 2D grid matrix of 1s and 0s
  color: string;
  accentColor?: string;
  cubesCount: number;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  avatar: string;
  gender: 'male' | 'female';
  location: string;
  bio: string;
  hearts: number; // نقاط القلوب
  score?: number;
  xp: number;
  level: number;
  wins: number;
  losses: number;
  totalGames: number;
  isVip: boolean;
  freeMessagesRemaining: number;
  referralCode: string;
  joinedAt: string;
  lastActiveDate?: string;
  createdAt?: string;
  ratings: number[]; // e.g. [5, 4, 5]
  isBanned?: boolean;
}

export interface GameRoundState {
  grid: (string | null)[][];
  availableShapes: Shape[];
  selectedShape: Shape | null;
  score: number;
  roundStatus: 'playing' | 'won' | 'lost';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  mediaType?: 'image' | 'video' | 'audio' | 'result';
  mediaUrl?: string;
  resultData?: {
    gridSize: number;
    score: number;
    hearts: number;
    difficulty: string;
  };
}

export interface PostItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'photo' | 'video';
  mediaUrl: string;
  title: string;
  caption: string;
  score: number;
  heartsEarned: number;
  gridSnapshot?: (string | null)[][];
  isPinned: boolean;
  likes: string[]; // user IDs
  comments: PostComment[];
  timestamp: string;
}

export interface PostComment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface PlayerReview {
  id: string;
  targetUserId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface AbuseReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'banned';
  timestamp: string;
}

export interface CryptoWalletInfo {
  currency: string;
  network: string;
  address: string;
  symbol: string;
  color: string;
  iconName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'game' | 'social' | 'reward' | 'system';
  read: boolean;
}
