export type Tab = 'dashboard' | 'ecolab' | 'ecopedia' | 'ecoupdate' | 'ecocreation' | 'ecochallenge' | 'absensi' | 'ecocontact';

export type AuthPage = 'login' | 'register' | 'forgot-password';

export type AdminTab = 
  | 'admin-dashboard' 
  | 'admin-rooms'
  | 'admin-users';

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export interface AttendanceSession {
  id: number;
  room_id: number;
  meeting_id: string | null;
  title: string;
  session_date: string;
  has_code: boolean;
  access_code?: string | null;
  status: 'open' | 'closed';
  opens_at: string;
  closes_at: string | null;
  hadir_count?: number;
  izin_count?: number;
  sakit_count?: number;
  alpa_count?: number;
  total_members?: number;
  my_status?: AttendanceStatus | null;
  my_note?: string | null;
  my_marked_by?: 'self' | 'admin' | null;
  my_checked_in_at?: string | null;
}

export interface RoomContact {
  id: number;
  room_id: number;
  name: string;
  role: string | null;
  instansi: string | null;
  email: string | null;
  phone: string | null;
  office_hours: string | null;
  avatar_url: string | null;
  sort_order: number;
}

export interface Room {
  id: number;
  name: string;
  description: string | null;
  room_key: string;
  cover_image: string | null;
  created_by: number;
  creator_name?: string;
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
  joined_at: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url: string | null;
  auth_provider: 'local' | 'google';
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

export interface Assignment {
  id: number;
  room_id: number;
  title: string;
  description: string;
  due_date: string | null;
  max_points: number;
  attachment_path?: string | null;
  attachment_name?: string | null;
  created_by: number;
  creator_name?: string;
  created_at: string;
  comments_count?: number;
  submissions_count?: number;
  graded_count?: number;
  my_submission?: AssignmentSubmission | null;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  room_id: number;
  student_id: number;
  filename: string;
  original_name: string;
  notes?: string | null;
  status: 'submitted' | 'graded';
  grade?: number | null;
  feedback?: string | null;
  submitted_at: string;
  graded_at?: string | null;
  student_name?: string;
  student_email?: string;
  student_avatar?: string | null;
}

export interface AssignmentComment {
  id: number;
  assignment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
  author_role: 'student' | 'admin';
  author_avatar?: string | null;
}

