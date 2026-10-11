// Development: Vite proxy mengarahkan /api → XAMPP lokal
// Production:  VITE_API_BASE_URL diisi URL Railway
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface VideoItem {
  id: number;
  student_id: number;
  student_name: string;
  title: string;
  category: string;
  duration: string;
  filename: string;
  original_name: string;
  views: number;
  likes: number;
  submitted_at: string;
  comments_count?: number;
}

export const videoService = {
  async getVideos(roomId?: number): Promise<VideoItem[]> {
    const url = roomId ? `${API_BASE}/get-videos.php?room_id=${roomId}` : `${API_BASE}/get-videos.php`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil daftar video dari server');
    }
    const data = await response.json();
    return data.videos || [];
  },

  async uploadVideo(title: string, category: string, duration: string, file: File, roomId?: number): Promise<VideoItem> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('duration', duration);
    formData.append('video_file', file);
    if (roomId) {
      formData.append('room_id', String(roomId));
    }

    const response = await fetch(`${API_BASE}/upload-video.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengunggah video');
    }
    return data.video;
  },

  async likeVideo(videoId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/like-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    return response.ok && data.success;
  },

  async trackView(videoId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/view-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    return response.ok && data.success;
  },

  async editVideo(videoId: number, title: string, category: string, duration?: string, file?: File): Promise<VideoItem> {
    const formData = new FormData();
    formData.append('video_id', videoId.toString());
    formData.append('title', title);
    formData.append('category', category);
    if (duration) formData.append('duration', duration);
    if (file) formData.append('video_file', file);

    const response = await fetch(`${API_BASE}/edit-video.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah video');
    }
    return data.video;
  },

  async deleteVideo(videoId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/delete-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus video');
    }
    return true;
  },

  async getVideoComments(videoId: number): Promise<VideoComment[]> {
    const response = await fetch(`${API_BASE}/get-video-comments.php?video_id=${videoId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil komentar video.');
    }
    const data = await response.json();
    return data.comments || [];
  },

  async addVideoComment(videoId: number, content: string): Promise<VideoComment> {
    const response = await fetch(`${API_BASE}/add-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId, content }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menambahkan komentar.');
    }
    return data.comment;
  },

  async editVideoComment(commentId: number, content: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/edit-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId, content }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah komentar.');
    }
    return true;
  },

  async deleteVideoComment(commentId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/delete-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus komentar.');
    }
    return true;
  }
};

export interface VideoComment {
  id: number;
  video_id: number;
  student_id: number;
  author: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
}
