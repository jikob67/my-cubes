/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/Game/GameBoard';
import { ShapesArea } from './components/Game/ShapesArea';
import { MergeBox } from './components/Game/MergeBox';
import { TrashBinModal } from './components/Game/TrashBinModal';
import { WinLossModal } from './components/Game/WinLossModal';
import { GameTopBar } from './components/Game/GameTopBar';
import { CommunityHub } from './components/Community/CommunityHub';
import { CryptoSubscriptions } from './components/Subscriptions/CryptoSubscriptions';
import { AISupportModal } from './components/Support/AISupportModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { AuthModal } from './components/Auth/AuthModal';
import { AuthGate } from './components/Auth/AuthGate';
import { PolicyModal } from './components/Policy/PolicyModal';
import { NotificationsModal } from './components/Notifications/NotificationsModal';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  FileText, 
  LogOut, 
  User, 
  Mail, 
  MapPin, 
  Heart, 
  Trophy,
  Trash2,
  Layers,
  Sparkles,
  RotateCcw,
  Flame,
  ShieldCheck,
  Grid3X3,
  Sliders,
  Palette,
} from 'lucide-react';

import {
  Shape,
  UserProfile,
  ChatMessage,
  PostItem,
  GameRoundState,
  AppNotification,
} from './types';
import {
  generateRandomShape,
  generateRoundShapes,
  rotateMatrix,
  mergeShapes,
} from './utils/shapeGenerator';
import {
  canPlaceShape,
  hasAnyValidMove,
  checkAndClearLines,
} from './utils/gameLogic';
import {
  getCurrentUser,
  saveCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredPosts,
  saveStoredPosts,
  getStoredPublicMessages,
  saveStoredPublicMessages,
  getStoredPrivateChats,
  saveStoredPrivateChats,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredBestScore,
  saveStoredBestScore,
} from './utils/storage';
import { sounds } from './utils/sound';

export default function App() {
  // Navigation & Preferences
  const [activeTab, setActiveTab] = useState<'game' | 'community' | 'subscriptions' | 'support' | 'settings'>('game');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isAr = language === 'ar';

  // User Authentication & Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(getStoredUsers());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);
  const [isAppPolicyOpen, setIsAppPolicyOpen] = useState(false);
  const [appPolicyTab, setAppPolicyTab] = useState<'privacy' | 'terms'>('privacy');

  // Game Settings & State - Starts from 4, 6, 8, 12... to infinite
  const [gridSize, setGridSize] = useState<number>(4);
  const [grid, setGrid] = useState<(string | null)[][]>(() =>
    Array(4).fill(null).map(() => Array(4).fill(null))
  );
  const [availableShapes, setAvailableShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [draggingShape, setDraggingShape] = useState<Shape | null>(null);
  const [mergeShapesList, setMergeShapesList] = useState<Shape[]>([]);
  const [trashShapes, setTrashShapes] = useState<Shape[]>([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Line Clear Visual Animations
  const [clearedRows, setClearedRows] = useState<number[]>([]);
  const [clearedCols, setClearedCols] = useState<number[]>([]);

  // Round Win/Loss & Score State
  const [roundStatus, setRoundStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [roundScore, setRoundScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => getStoredBestScore());
  const [roundHeartsEarned, setRoundHeartsEarned] = useState<number>(30);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [gameLevel, setGameLevel] = useState<number>(1);

  // Community Data
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [privateChats, setPrivateChats] = useState<Record<string, ChatMessage[]>>(getStoredPrivateChats());

  // Notifications State & Modal
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: isAr ? 'الآن' : 'Just now',
      read: false,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  // Initialize App on mount
  useEffect(() => {
    // Load User
    const savedUser = getCurrentUser();
    if (savedUser) {
      const today = new Date().toISOString().split('T')[0];
      if (savedUser.lastActiveDate !== today) {
        savedUser.freeMessagesRemaining = 12;
        savedUser.lastActiveDate = today;
        saveCurrentUser(savedUser);
      }
      setCurrentUser(savedUser);
    } else {
      setIsAuthOpen(true);
    }

    // Load Posts & Messages
    setPosts(getStoredPosts());
    setPublicMessages(getStoredPublicMessages());

    // Initialize First Game Round
    initNewRound(5);
  }, []);

  // Sync Dark mode to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Start / Reset Game Round
  const initNewRound = (size: number = gridSize) => {
    setGrid(Array(size).fill(null).map(() => Array(size).fill(null)));
    const shapes = generateRoundShapes(3, size <= 4 ? 'easy' : size === 5 ? 'medium' : 'hard');
    setAvailableShapes(shapes);
    setSelectedShape(null);
    setDraggingShape(null);
    setMergeShapesList([]);
    setRoundStatus('playing');
    setRoundScore(0);
    setClearedRows([]);
    setClearedCols([]);
  };

  // Change Grid Difficulty / Level
  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    initNewRound(newSize);
  };

  // Check Game Over Condition
  const checkGameOverState = (currentBoard: (string | null)[][], shapesPool: Shape[]) => {
    const hasMove = hasAnyValidMove(currentBoard, gridSize, shapesPool);
    if (!hasMove && shapesPool.length > 0) {
      // Check if player has restorable shapes in trash
      const hasTrashMove = hasAnyValidMove(currentBoard, gridSize, trashShapes);
      if (!hasTrashMove) {
        // Trigger Game Over!
        setRoundStatus('lost');
        if (roundScore > bestScore) {
          setBestScore(roundScore);
          saveStoredBestScore(roundScore);
        }
      }
    }
  };

  // Place Shape Handler with Row/Column Line Clearing and Game Over checking
  const handlePlaceShape = (startR: number, startC: number, shape: Shape): boolean => {
    if (!canPlaceShape(grid, gridSize, startR, startC, shape)) {
      return false;
    }

    const sRows = shape.matrix.length;
    const sCols = shape.matrix[0].length;
    const newGrid = grid.map((row) => [...row]);

    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
        if (shape.matrix[r][c] === 1) {
          newGrid[startR + r][startC + c] = shape.color;
        }
      }
    }

    sounds.playPlace();

    // Remove placed shape from available list
    const remainingShapes = availableShapes.filter((s) => s.id !== shape.id);
    setAvailableShapes(remainingShapes);
    setSelectedShape(null);
    setDraggingShape(null);

    // Calculate base placement score
    const placementPoints = shape.cubesCount * 15 + 20;
    let currentScore = roundScore + placementPoints;

    // Check completed full rows and columns
    const lineResult = checkAndClearLines(newGrid, gridSize, streakCount);

    if (lineResult.linesClearedCount > 0) {
      // Trigger line clear visual flash
      setClearedRows(lineResult.clearedRows);
      setClearedCols(lineResult.clearedCols);
      sounds.playWin();

      currentScore += lineResult.pointsEarned;
      const newHearts = roundHeartsEarned + lineResult.heartsEarned;
      setRoundHeartsEarned(newHearts);
      setStreakCount((prev) => prev + 1);

      // Apply cleared grid after brief flash effect
      setTimeout(() => {
        setGrid(lineResult.newGrid);
        setClearedRows([]);
        setClearedCols([]);

        // If all shapes in current wave are used, spawn next wave of 3 shapes
        let activePool = remainingShapes;
        if (remainingShapes.length === 0) {
          activePool = generateRoundShapes(3, gridSize <= 4 ? 'easy' : gridSize === 5 ? 'medium' : 'hard');
          setAvailableShapes(activePool);
          setGameLevel((prev) => prev + 1);
        }

        // Check Game Over on the cleared board
        checkGameOverState(lineResult.newGrid, activePool);
      }, 250);
    } else {
      setGrid(newGrid);

      // If all shapes in current wave are used, spawn next wave of 3 shapes
      let activePool = remainingShapes;
      if (remainingShapes.length === 0) {
        activePool = generateRoundShapes(3, gridSize <= 4 ? 'easy' : gridSize === 5 ? 'medium' : 'hard');
        setAvailableShapes(activePool);
        setGameLevel((prev) => prev + 1);
      }

      // Check Game Over on updated board
      checkGameOverState(newGrid, activePool);
    }

    setRoundScore(currentScore);

    // Update Best Score if exceeded
    if (currentScore > bestScore) {
      setBestScore(currentScore);
      saveStoredBestScore(currentScore);
    }

    // Update user profile stats
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        score: (currentUser.score || 0) + placementPoints,
        xp: currentUser.xp + 20,
      };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }

    return true;
  };

  // Rotate Shape 90 degrees
  const handleRotateShape = (shapeId: string) => {
    setAvailableShapes((prev) =>
      prev.map((s) => {
        if (s.id === shapeId) {
          return {
            ...s,
            matrix: rotateMatrix(s.matrix),
          };
        }
        return s;
      })
    );

    if (selectedShape && selectedShape.id === shapeId) {
      setSelectedShape({
        ...selectedShape,
        matrix: rotateMatrix(selectedShape.matrix),
      });
    }
  };

  // Move Shape to Trash Bin
  const handleMoveToTrash = (shape: Shape) => {
    sounds.playTrash();
    const updated = availableShapes.filter((s) => s.id !== shape.id);
    setAvailableShapes(updated);
    setTrashShapes((prev) => [...prev, shape]);
    if (selectedShape?.id === shape.id) {
      setSelectedShape(null);
    }

    // Check if new wave is needed if pool emptied
    if (updated.length === 0) {
      const nextWave = generateRoundShapes(3, gridSize <= 4 ? 'easy' : gridSize === 5 ? 'medium' : 'hard');
      setAvailableShapes(nextWave);
    }
  };

  // Restore Shape from Trash Bin
  const handleRestoreShape = (shape: Shape) => {
    setTrashShapes((prev) => prev.filter((s) => s.id !== shape.id));
    setAvailableShapes((prev) => [...prev, shape]);
  };

  // Empty Trash Bin
  const handleEmptyTrash = () => {
    setTrashShapes([]);
  };

  // Add Shape to Merge Box
  const handleAddShapeToMerge = (shape: Shape) => {
    setAvailableShapes((prev) => prev.filter((s) => s.id !== shape.id));
    setMergeShapesList((prev) => [...prev, shape]);
    if (selectedShape?.id === shape.id) {
      setSelectedShape(null);
    }
  };

  // Remove Shape from Merge Box
  const handleRemoveFromMerge = (shapeId: string) => {
    const shape = mergeShapesList.find((s) => s.id === shapeId);
    if (shape) {
      setMergeShapesList((prev) => prev.filter((s) => s.id !== shapeId));
      setAvailableShapes((prev) => [...prev, shape]);
    }
  };

  // Execute Shapes Fusion
  const handleExecuteMerge = () => {
    if (mergeShapesList.length < 2) return;
    const fusedShape = mergeShapes(mergeShapesList);
    if (fusedShape) {
      setMergeShapesList([]);
      setAvailableShapes((prev) => [...prev, fusedShape]);
      setSelectedShape(fusedShape);
    }
  };

  // Community Chat Handlers
  const handleSendPublicMessage = (
    text: string,
    mediaType?: 'image' | 'video' | 'audio' | 'result',
    mediaUrl?: string
  ) => {
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      content: text,
      mediaType,
      mediaUrl,
      resultData:
        mediaType === 'result'
          ? {
              gridSize,
              score: roundScore || 657,
              hearts: roundHeartsEarned || 30,
              difficulty: gridSize === 4 ? 'سهل' : gridSize === 5 ? 'متوسط' : 'متقدم',
            }
          : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...publicMessages, newMsg];
    setPublicMessages(updated);
    saveStoredPublicMessages(updated);

    if (!currentUser.isVip) {
      const updatedUser = {
        ...currentUser,
        freeMessagesRemaining: Math.max(0, currentUser.freeMessagesRemaining - 1),
      };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  };

  const handleSendPrivateMessage = (
    targetUserId: string,
    text: string,
    mediaType?: 'image' | 'video' | 'audio' | 'result',
    mediaUrl?: string
  ) => {
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: `priv_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      content: text,
      mediaType,
      mediaUrl,
      resultData:
        mediaType === 'result'
          ? {
              gridSize,
              score: roundScore || 657,
              hearts: roundHeartsEarned || 30,
              difficulty: gridSize === 4 ? 'سهل' : gridSize === 5 ? 'متوسط' : 'متقدم',
            }
          : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedPrivate = {
      ...privateChats,
      [targetUserId]: [...(privateChats[targetUserId] || []), newMsg],
    };
    setPrivateChats(updatedPrivate);
    saveStoredPrivateChats(updatedPrivate);

    if (!currentUser.isVip) {
      const updatedUser = {
        ...currentUser,
        freeMessagesRemaining: Math.max(0, currentUser.freeMessagesRemaining - 1),
      };
      setCurrentUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  };

  // Community Posts Handlers
  const handleAddPost = (newPostData: Omit<PostItem, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    const post: PostItem = {
      ...newPostData,
      id: `post_${Date.now()}`,
      likes: [],
      comments: [],
      timestamp: isAr ? 'منذ لحظات' : 'Just now',
    };

    const updated = [post, ...posts];
    setPosts(updated);
    saveStoredPosts(updated);
  };

  const handleDeletePost = (postId: string) => {
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    saveStoredPosts(updated);
  };

  const handleTogglePinPost = (postId: string) => {
    const updated = posts.map((p) =>
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    );
    setPosts(updated);
    saveStoredPosts(updated);
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const hasLiked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: hasLiked
            ? p.likes.filter((id) => id !== currentUser.id)
            : [...p.likes, currentUser.id],
        };
      }
      return p;
    });

    setPosts(updated);
    saveStoredPosts(updated);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    if (!currentUser) return;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c_${Date.now()}`,
              userId: currentUser.id,
              username: currentUser.username,
              userAvatar: currentUser.avatar,
              text: commentText,
              timestamp: isAr ? 'الآن' : 'Now',
            },
          ],
        };
      }
      return p;
    });

    setPosts(updated);
    saveStoredPosts(updated);
  };

  // Subscriptions & Hearts VIP upgrades
  const handleUpgradeVip = () => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      isVip: true,
      freeMessagesRemaining: 9999,
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
  };

  const handleRedeemHeartsForVip = () => {
    if (!currentUser || currentUser.hearts < 300) return;
    const updated: UserProfile = {
      ...currentUser,
      hearts: currentUser.hearts - 300,
      isVip: true,
      freeMessagesRemaining: 9999,
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    alert(isAr ? 'تم استبدال 300 قلب وترقية حسابك إلى VIP بنجاح! ✨' : '300 Hearts redeemed! VIP Activated! ✨');
  };

  const handleShareApp = () => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      hearts: currentUser.hearts + 50,
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    alert(isAr ? 'شكراً لمشاركة my cubes! تم إضافة +50 نقطة قلب إلى رصيدك! ❤️' : 'Thanks for sharing! +50 Hearts awarded! ❤️');
  };

  const difficultyLabel = gridSize === 4 ? (isAr ? 'سهل' : 'EASY') : gridSize === 5 ? (isAr ? 'متوسط' : 'MEDIUM') : (isAr ? 'صعب' : 'HARD MODE');

  // If no user is logged in, show the full onboarding / registration gateway as the first page!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <AuthGate
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            saveCurrentUser(user);
            setAllUsers(getStoredUsers());
          }}
          isAr={isAr}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20 text-slate-900 dark:text-slate-100 flex flex-col transition-all duration-700">
      
      {/* 1. Header Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={isDarkMode ? 'dark' : 'light'}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        language={language}
        toggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        unreadNotifsCount={notifications.filter((n) => !n.read).length}
        openNotifications={() => {
          sounds.playClick();
          setIsNotificationsOpen(true);
        }}
        openProfile={() => currentUser && setViewingProfileUser(currentUser)}
        openAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('mycubes_current_user');
        }}
        allUsers={allUsers}
      />

      {/* 2. Main Body Content Area with smooth transitions */}
      <main className="flex-1 w-full flex flex-col items-center animate-fadeIn">
        
        {/* GAME TAB */}
        {activeTab === 'game' && (
          <div className="w-full max-w-6xl mx-auto px-4 py-3 sm:py-5 flex flex-col items-center">
            
            {/* Top Bar UI Component (Back, HARD MODE, THIS WEEK, SCORE: ❤️ 657, Trash, ↻) */}
            <GameTopBar
              score={roundScore}
              bestScore={bestScore}
              level={gameLevel}
              difficultyLabel={difficultyLabel}
              onBack={() => {
                initNewRound(4);
              }}
              onRestart={() => initNewRound()}
              onOpenTrash={() => setIsTrashOpen(true)}
              trashCount={trashShapes.length}
              isAr={isAr}
            />

            {/* Progressive Grid Size & Cubes Count Selector: Clean single-row with stepper and total squares */}
            <div className="w-full max-w-xl mb-3.5 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-[#00ECE3]" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {isAr ? 'أبعاد الشبكة التدريجية:' : 'Progressive Grid Size:'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3] font-mono text-xs font-black border border-[#00ECE3]/40">
                    {gridSize}×{gridSize} ({gridSize * gridSize} {isAr ? 'مربع' : 'cubes'})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Stepper decrease button */}
                  <button
                    type="button"
                    id="grid-size-dec-btn"
                    onClick={() => {
                      const allSizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24];
                      const prev = [...allSizes].reverse().find((s) => s < gridSize);
                      if (prev && prev >= 4) {
                        handleGridSizeChange(prev);
                      } else if (gridSize > 4) {
                        handleGridSizeChange(gridSize - 1);
                      }
                    }}
                    disabled={gridSize <= 4}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00ECE3] hover:text-slate-950 text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center transition-all shadow-xs"
                    title={isAr ? 'تقليل حجم الشبكة تدريجياً (-1)' : 'Decrease grid size (-1)'}
                  >
                    -
                  </button>

                  {/* Stepper increase button */}
                  <button
                    type="button"
                    id="grid-size-inc-btn"
                    onClick={() => {
                      const allSizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24];
                      const next = allSizes.find((s) => s > gridSize);
                      if (next) {
                        handleGridSizeChange(next);
                      } else {
                        handleGridSizeChange(gridSize + 1);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#00ECE3] hover:text-slate-950 text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center transition-all shadow-xs"
                    title={isAr ? 'زيادة حجم الشبكة تدريجياً (+1)' : 'Increase grid size (+1)'}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Progressive Presets Ribbon (Horizontal Scrollable, No Wrapping, No Overlaps) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar scroll-smooth">
                {[4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20].map((size) => {
                  const isActive = gridSize === size;
                  const totalSquares = size * size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleGridSizeChange(size)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#00ECE3] text-slate-950 shadow-md shadow-[#00ECE3]/30 ring-2 ring-[#00ECE3] scale-102'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <span>{size}×{size}</span>
                      <span className={`text-[10px] font-normal ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        ({totalSquares})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Centered Grid */}
            <div className="w-full mb-5 flex justify-center">
              <GameBoard
                grid={grid}
                selectedShape={selectedShape}
                draggingShape={draggingShape}
                onPlaceShape={handlePlaceShape}
                gridSize={gridSize}
                isAr={isAr}
                clearedRows={clearedRows}
                clearedCols={clearedCols}
                onClearDraggingShape={() => setDraggingShape(null)}
              />
            </div>

            {/* Available Shapes Pool (1 to 3 shapes below grid) */}
            <div className="w-full mb-4">
              <ShapesArea
                availableShapes={availableShapes}
                selectedShape={selectedShape}
                onSelectShape={setSelectedShape}
                onStartDrag={setDraggingShape}
                onRotateShape={handleRotateShape}
                onMoveToTrash={handleMoveToTrash}
                onMoveToMerge={handleAddShapeToMerge}
                isAr={isAr}
              />
            </div>

            {/* Shape Fusion & Merge Box */}
            <div className="w-full">
              <MergeBox
                mergeShapesList={mergeShapesList}
                onAddShapeToMerge={handleAddShapeToMerge}
                onRemoveFromMerge={handleRemoveFromMerge}
                onExecuteMerge={handleExecuteMerge}
                isAr={isAr}
              />
            </div>

          </div>
        )}

        {/* COMMUNITY HUB TAB */}
        {activeTab === 'community' && (
          <CommunityHub
            currentUser={currentUser}
            allUsers={allUsers}
            publicMessages={publicMessages}
            onSendPublicMessage={handleSendPublicMessage}
            privateChats={privateChats}
            onSendPrivateMessage={handleSendPrivateMessage}
            onOpenProfileForUser={(user) => setViewingProfileUser(user)}
            onOpenSubscriptions={() => setActiveTab('subscriptions')}
            isAr={isAr}
          />
        )}

        {/* SUBSCRIPTIONS & CRYPTO WALLETS TAB */}
        {activeTab === 'subscriptions' && (
          <CryptoSubscriptions
            currentUser={currentUser}
            onUpgradeVip={handleUpgradeVip}
            onRedeemHeartsForVip={handleRedeemHeartsForVip}
            onShareApp={handleShareApp}
            isAr={isAr}
          />
        )}

        {/* AI TECHNICAL SUPPORT TAB */}
        {activeTab === 'support' && (
          <AISupportModal
            currentUser={currentUser}
            isAr={isAr}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-[#00ECE3]/15 text-[#00a8a1] dark:text-[#00ECE3]">
                  <SettingsIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {isAr ? 'إعدادات المنصة والحساب' : 'Platform & Account Settings'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr ? 'تخصيص الواجهة، الصوتيات، والبيانات الشخصية' : 'Customize theme, audio, and personal profile'}
                  </p>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Theme Switcher */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <span className="text-xs font-black block text-slate-900 dark:text-white">
                        {isAr ? 'المظهر الليلي / النهاري' : 'Theme Mode'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isDarkMode ? (isAr ? 'الوضع الليلي مفعّل' : 'Dark Mode Enabled') : (isAr ? 'الوضع النهاري مفعّل' : 'Light Mode Enabled')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00ECE3] text-slate-950 font-black text-xs shadow-sm hover:opacity-90"
                  >
                    {isAr ? 'تبديل' : 'Toggle'}
                  </button>
                </div>

                {/* Language Switcher */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#00ECE3]" />
                    <div>
                      <span className="text-xs font-black block text-slate-900 dark:text-white">
                        {isAr ? 'لغة التطبيق' : 'Language'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {language === 'ar' ? 'العربية (Arabic)' : 'English'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs hover:opacity-90"
                  >
                    {language === 'ar' ? 'English' : 'العربية'}
                  </button>
                </div>

                {/* Sound FX Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                    <div>
                      <span className="text-xs font-black block text-slate-900 dark:text-white">
                        {isAr ? 'المؤثرات الصوتية للألعاب' : 'Game Sound Effects'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {soundEnabled ? (isAr ? 'الأصوات مفعلة' : 'Sounds Active') : (isAr ? 'الأصوات مكتومة' : 'Sounds Muted')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      soundEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {soundEnabled ? (isAr ? 'مفعل' : 'On') : (isAr ? 'معطل' : 'Off')}
                  </button>
                </div>

              </div>

              {/* Personal Profile Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#00ECE3]/10 via-cyan-950/20 to-transparent border border-[#00ECE3]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00ECE3] shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900 dark:text-white">{currentUser.fullName}</span>
                      <span className="text-xs font-bold text-[#00a8a1] dark:text-[#00ECE3]">@{currentUser.username}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{currentUser.email}</span>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 font-bold text-rose-500">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        {currentUser.hearts} {isAr ? 'قلب' : 'Hearts'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Trophy className="w-3.5 h-3.5" />
                        {currentUser.wins} {isAr ? 'فوز' : 'Wins'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingProfileUser(currentUser)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-200"
                  >
                    {isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem('mycubes_current_user');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500/20 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
                  </button>
                </div>
              </div>

              {/* Policies & Compliance Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAppPolicyTab('privacy');
                      setIsAppPolicyOpen(true);
                    }}
                    className="flex items-center gap-1 font-bold text-[#00a8a1] dark:text-[#00ECE3] hover:underline"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isAr ? 'سياسة الخصوصية الرسمية' : 'Privacy Policy'}</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setAppPolicyTab('terms');
                      setIsAppPolicyOpen(true);
                    }}
                    className="flex items-center gap-1 font-bold text-[#00a8a1] dark:text-[#00ECE3] hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isAr ? 'شروط وسياسة الاستخدام' : 'Terms of Use'}</span>
                  </button>
                </div>
                <span>my cubes V2.5 — Secure & Verified</span>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {/* 1. Win / Loss Game Over Modal */}
      <WinLossModal
        status={roundStatus}
        roundHeartsEarned={roundHeartsEarned}
        score={roundScore}
        bestScore={bestScore}
        onNewRound={() => initNewRound()}
        onShareResult={() => {
          setRoundStatus('playing');
          setActiveTab('community');
          handleSendPublicMessage(
            isAr ? `حققت فوزاً رائعاً في لعبة my cubes بنتيجة ${roundScore} نقطة! 🏆` : `Scored ${roundScore} points in my cubes! 🏆`,
            'result'
          );
        }}
        isAr={isAr}
      />

      {/* 2. Trash Bin Modal */}
      <TrashBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        trashShapes={trashShapes}
        onRestoreShape={handleRestoreShape}
        onEmptyTrash={handleEmptyTrash}
        isAr={isAr}
      />

      {/* 3. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          saveCurrentUser(user);
        }}
        isAr={isAr}
      />

      {/* 4. User Profile Modal */}
      <UserProfileModal
        user={viewingProfileUser}
        currentUser={currentUser}
        isOpen={!!viewingProfileUser}
        onClose={() => setViewingProfileUser(null)}
        onUpdateProfile={(updated) => {
          if (currentUser) {
            const newUser = { ...currentUser, ...updated };
            setCurrentUser(newUser);
            saveCurrentUser(newUser);
          }
        }}
        onSubmitReview={(targetUserId, rating, comment) => {
          setAllUsers((prev) =>
            prev.map((u) =>
              u.id === targetUserId ? { ...u, ratings: [...u.ratings, rating] } : u
            )
          );
          alert(isAr ? 'تم إرسال تقييمك للاعب بنجاح!' : 'Rating submitted successfully!');
        }}
        onSubmitReport={(targetUserId, reason, details) => {
          alert(isAr ? 'تم استلام بلاغك وسيقوم النظام الذكي بالتحقق الفوري.' : 'Report submitted for review.');
        }}
        isAr={isAr}
      />

      {/* 5. Policy & Terms Modal */}
      <PolicyModal
        isOpen={isAppPolicyOpen}
        onClose={() => setIsAppPolicyOpen(false)}
        defaultTab={appPolicyTab}
        isAr={isAr}
      />

      {/* 6. Notifications Modal (Bell functionality) */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAllNotifications}
        onNavigateTab={(tab) => setActiveTab(tab)}
        isAr={isAr}
      />

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold">my cubes © {new Date().getFullYear()} — {isAr ? 'جميع الأعمار' : 'All Ages Fun Game'}</span>
            <button
              onClick={() => {
                setAppPolicyTab('privacy');
                setIsAppPolicyOpen(true);
              }}
              className="hover:text-[#00ECE3] transition-colors text-[11px] underline"
            >
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <button
              onClick={() => {
                setAppPolicyTab('terms');
                setIsAppPolicyOpen(true);
              }}
              className="hover:text-[#00ECE3] transition-colors text-[11px] underline"
            >
              {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <a href="https://jacobalcadiapps.wordpress.com" target="_blank" rel="noreferrer" className="hover:text-[#00ECE3] transition-colors">
              WordPress
            </a>
            <a href="https://jacobalcadiapps.blogspot.com" target="_blank" rel="noreferrer" className="hover:text-[#00ECE3] transition-colors">
              Blogspot
            </a>
            <span>Support: jikob67@gmail.com</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
