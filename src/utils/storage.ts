import { UserProfile, ChatMessage, PostItem, PlayerReview, AbuseReport, CryptoWalletInfo, AppNotification } from '../types';

export const CRYPTO_WALLETS: CryptoWalletInfo[] = [
  {
    currency: 'Solana (SOL)',
    network: 'Solana Mainnet',
    address: 'F2UJS1wNzsfcQTknPsxBk7B25qWbU9JtiRW1eRgdwLJY',
    symbol: 'SOL',
    color: '#9945FF',
    iconName: 'Zap',
  },
  {
    currency: 'Ethereum (ETH)',
    network: 'ERC-20 Mainnet',
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    symbol: 'ETH',
    color: '#627EEA',
    iconName: 'Coins',
  },
  {
    currency: 'Monad (MON)',
    network: 'Monad Network',
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    symbol: 'MON',
    color: '#836EF9',
    iconName: 'Flame',
  },
  {
    currency: 'Base (ETH/BASE)',
    network: 'Base L2 Network',
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    symbol: 'BASE',
    color: '#0052FF',
    iconName: 'Layers',
  },
  {
    currency: 'Sui (SUI)',
    network: 'Sui Network',
    address: '0x41629e22deff6965100a4c28567dea45036d0360e6126a9c7f9c8fb1860a36c4',
    symbol: 'SUI',
    color: '#4DA2FF',
    iconName: 'Droplet',
  },
  {
    currency: 'Polygon (POL/MATIC)',
    network: 'Polygon PoS',
    address: '0xC5BC11e19D3De81a1365259A99AF4D88c62a8C50',
    symbol: 'POL',
    color: '#8247E5',
    iconName: 'Hexagon',
  },
  {
    currency: 'Bitcoin (BTC)',
    network: 'Bitcoin Native SegWit',
    address: 'bc1q9s855ehn959s5t2g6kjt9q7pt5t55n9gq7gpd7',
    symbol: 'BTC',
    color: '#F7931A',
    iconName: 'CircleDollarSign',
  },
];

const DEFAULT_USERS: UserProfile[] = [];

const DEFAULT_POSTS: PostItem[] = [];

const DEFAULT_PUBLIC_MESSAGES: ChatMessage[] = [];

export function getStoredUsers(): UserProfile[] {
  try {
    const saved = localStorage.getItem('mycubes_users');
    if (saved) {
      const parsed: UserProfile[] = JSON.parse(saved);
      // Filter out any old legacy mock users
      const cleanUsers = parsed.filter(u => !['user_1', 'user_2', 'user_3'].includes(u.id));
      return cleanUsers;
    }
  } catch (e) {}
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: UserProfile[]) {
  try {
    localStorage.setItem('mycubes_users', JSON.stringify(users));
  } catch (e) {}
}

export function getCurrentUser(): UserProfile | null {
  try {
    const saved = localStorage.getItem('mycubes_current_user');
    if (saved) {
      const user: UserProfile = JSON.parse(saved);
      // If it was a mock user from before, reset
      if (['user_1', 'user_2', 'user_3'].includes(user.id)) {
        localStorage.removeItem('mycubes_current_user');
        return null;
      }
      return user;
    }
  } catch (e) {}
  return null;
}

export function saveCurrentUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem('mycubes_current_user', JSON.stringify(user));
      // also update in users list
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      saveStoredUsers(users);
    } else {
      localStorage.removeItem('mycubes_current_user');
    }
  } catch (e) {}
}

export function getStoredPosts(): PostItem[] {
  try {
    const saved = localStorage.getItem('mycubes_posts');
    if (saved) {
      const parsed: PostItem[] = JSON.parse(saved);
      const cleanPosts = parsed.filter(p => !['post_1', 'post_2'].includes(p.id));
      return cleanPosts;
    }
  } catch (e) {}
  return DEFAULT_POSTS;
}

export function saveStoredPosts(posts: PostItem[]) {
  try {
    localStorage.setItem('mycubes_posts', JSON.stringify(posts));
  } catch (e) {}
}

export function getStoredPublicMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem('mycubes_public_chat');
    if (saved) {
      const parsed: ChatMessage[] = JSON.parse(saved);
      const cleanMsgs = parsed.filter(m => !['msg_1', 'msg_2'].includes(m.id));
      return cleanMsgs;
    }
  } catch (e) {}
  return DEFAULT_PUBLIC_MESSAGES;
}

export function saveStoredPublicMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem('mycubes_public_chat', JSON.stringify(messages));
  } catch (e) {}
}

export function getStoredPrivateChats(): Record<string, ChatMessage[]> {
  try {
    const saved = localStorage.getItem('mycubes_private_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {}
  return {};
}

export function saveStoredPrivateChats(chats: Record<string, ChatMessage[]>) {
  try {
    localStorage.setItem('mycubes_private_chats', JSON.stringify(chats));
  } catch (e) {}
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const saved = localStorage.getItem('mycubes_notifications');
    if (saved) {
      const parsed: AppNotification[] = JSON.parse(saved);
      // Filter out any old legacy mock notification IDs
      return parsed.filter((n) => !['n1', 'n2', 'fake_1', 'fake_2'].includes(n.id));
    }
  } catch (e) {}
  return [];
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem('mycubes_notifications', JSON.stringify(notifs));
  } catch (e) {}
}

export function getStoredBestScore(): number {
  try {
    const saved = localStorage.getItem('mycubes_best_score');
    if (saved) return parseInt(saved, 10) || 657;
  } catch (e) {}
  return 657;
}

export function saveStoredBestScore(score: number) {
  try {
    localStorage.setItem('mycubes_best_score', score.toString());
  } catch (e) {}
}

export function getStoredUnlockedMaxGridSize(): number {
  try {
    const saved = localStorage.getItem('mycubes_max_unlocked_grid');
    if (saved) {
      const val = parseInt(saved, 10);
      if (val >= 4 && val <= 20) return val;
    }
  } catch (e) {}
  return 4; // Start strictly from 4x4
}

export function saveStoredUnlockedMaxGridSize(size: number) {
  try {
    localStorage.setItem('mycubes_max_unlocked_grid', size.toString());
  } catch (e) {}
}

