// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    totalPlayTime: number;
    followers: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Game types
export interface Game {
  _id: string;
  title: string;
  description: string;
  creator?: string | { _id?: string; username: string; avatar: string };
  creatorId?: string;
  creatorName?: string;
  thumbnail?: string;
  category: string;
  mainFile?: string;
  version?: number;
  rating?: number;
  plays: number;
  likes: number;
  comments?: number;
  featured?: boolean;
  published: string | boolean;
  updated?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  tags?: string[];
  fileSize?: number;
  stats?: {
    plays: number;
    likes: number;
    averageRating: number;
    totalRatings: number;
  };
  code?: string;
  scripts?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  assets?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  settings?: {
    width: number;
    height: number;
    fps: number;
    maxPlayers?: number;
    isMultiplayer: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface GameSession {
  _id: string;
  gameId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  score: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface Comment {
  _id: string;
  gameId: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  games: Game[];
  currentGame: Game | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
}

// Multiplayer types
export interface Player {
  userId: string;
  username: string;
  joinedAt: string;
}

export interface MultiplayerRoom {
  _id: string;
  gameId: string;
  roomId: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameState: Record<string, unknown>;
  createdAt: string;
}

// Editor types
export interface GameAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'json';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface GameScript {
  id: string;
  name: string;
  code: string;
  language: 'javascript' | 'typescript' | 'wbw';
  createdAt: string;
}

export interface GameProject {
  _id?: string;
  title: string;
  description: string;
  assets: GameAsset[];
  scripts: GameScript[];
  settings: {
    width: number;
    height: number;
    fps: number;
    physics: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  _id: string;
  gameId: string;
  userId: string;
  username: string;
  avatar?: string;
  rank: number;
  score: number;
  playTime: number;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
