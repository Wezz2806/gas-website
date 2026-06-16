export type Tab = 'dashboard' | 'ecopedia' | 'ecolab' | 'ecoupdate' | 'ecocreation' | 'ecochallenge' | 'ecocontact' | 'support';

export type AuthPage = 'login' | 'register' | 'forgot-password';

/** @deprecated Teacher module removed — kept for type compatibility only */
export type TeacherTab = 
  | 'teacher-dashboard' 
  | 'teacher-meetings' 
  | 'teacher-submissions' 
  | 'teacher-quiz' 
  | 'teacher-progress';


export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
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
