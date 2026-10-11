export type Tab = 'dashboard' | 'ecopedia' | 'ecolab' | 'ecocreation' | 'ecochallenge';

export type AuthPage = 'login' | 'register' | 'forgot-password';

export type AdminTab = 
  | 'admin-dashboard' 
  | 'admin-rooms'
  | 'admin-users'
  | 'admin-ecopedia'
  | 'admin-ecolab'
  | 'admin-ecochallenge'
  | 'admin-ecocreation';

export interface Room {
  id: number;
  name: string;
  description: string | null;
  room_key: string;
  cover_image: string | null;
  created_by: number;
  creator_name?: string;
  gamification_enabled: number | boolean;
  is_active: number | boolean;
  members_count?: number;
  materials_count?: number;
  meetings_count?: number;
  is_member?: number | boolean;
  joined_at?: string;
  created_at?: string;
}

export interface RoomMember {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  eco_points: number;
  streak: number;
  joined_at: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url: string | null;
  streak: number;
  auth_provider: 'local' | 'google';
  last_checkin?: string | null;
}

export interface Book {
  id: string;
  title: string;
  coverUrl: string;
  category: string;
  tagClass: string;
  icon: string;
  description: string;
  content: string;
  pdfUrl: string;
  flipUrl?: string;
}

export interface Meeting {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'ongoing' | 'scheduled';
}

export interface VideoItem {
  id: string;
  title: string;
  coverUrl: string;
  category: string;
  duration: string;
  description: string;
}

export interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  scale: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  coverUrl: string;
  category: string;
  date: string;
  readTime: string;
  description: string;
  content: string;
  author: string;
  likes: number;
  commentsCount: number;
  url: string;
  isSaved?: boolean;
  isLiked?: boolean;
}

export interface CreationComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface VideoCreation {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  authorAvatar: string;
  likes: number;
  views: string;
  timeAgo: string;
  comments: CreationComment[];
  duration: string;
  category: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface JournalRow {
  row_index: number;
  tanggal: string;
  warna: string;
  aroma: string;
  gas: string;
  alasan: string;
  solusi: string;
}
