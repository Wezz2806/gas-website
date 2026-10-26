// src/services/videoService.ts
import { getAuthToken, apiFetch } from './apiClient';

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

export interface VideoComment {
  id: number;
  video_id: number;
  student_id: number;
  author: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
}

/**
 * Helper internal untuk mem-parse respon fetch dengan aman (mencegah syntax error '<' jika server mengembalikan HTML).
 */
async function parseResponseSafe(response: Response): Promise<any> {
  let data: any;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { message: 'Format data JSON dari server tidak valid.' };
    }
  } else {
    const text = await response.text();
    data = { message: text || `Server mengembalikan status ${response.status}.` };
  }
  return data;
}

export const videoService = {
  async getVideos(roomId?: number): Promise<VideoItem[]> {
    const url = roomId ? `${API_BASE}/get-videos.php?room_id=${roomId}` : `${API_BASE}/get-videos.php`;
    const response = await apiFetch(url, {
      method: 'GET',
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengambil daftar video dari server.');
    }
    return data.videos || [];
  },

  /**
   * Mengunggah karya video murid dengan tracking progres real-time.
   */
  uploadVideo(
    title: string, 
    category: string, 
    duration: string, 
    file: File, 
    roomId?: number,
    onProgress?: (percent: number) => void
  ): Promise<VideoItem> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category || 'Umum');
      formData.append('duration', duration || '00:00');
      formData.append('video_file', file);
      if (roomId) {
        formData.append('room_id', String(roomId));
      }

      xhr.open('POST', `${API_BASE}/upload-video.php`, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('X-Session-Token', token);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        let data: any;
        const contentType = xhr.getResponseHeader('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = { message: xhr.responseText || 'Format respon server tidak valid.' };
          }
        } else {
          data = { message: xhr.responseText || `Server mengembalikan respon error status ${xhr.status}.` };
        }

        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          if (onProgress) onProgress(100);
          resolve(data.video);
        } else {
          let errorMsg = data.message || 'Gagal mengunggah video ke server.';
          if (xhr.status === 413) {
            errorMsg = data.message || 'Ukuran berkas video melebihi batas maksimal server (50MB). Silakan kompresi video Anda.';
          } else if (xhr.status === 401) {
            errorMsg = data.message || 'Sesi login telah berakhir. Silakan login kembali.';
          } else if (xhr.status === 503) {
            errorMsg = 'Koneksi database/server backend sedang offline. Silakan coba sesaat lagi.';
          }
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Koneksi jaringan terputus saat mengunggah video. Pastikan internet stabil dan server backend aktif.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Waktu unggah habis (timeout). File video terlalu besar atau koneksi internet lambat.'));
      };

      xhr.timeout = 300000; // 5 menit
      xhr.send(formData);
    });
  },

  async likeVideo(videoId: number): Promise<boolean> {
    const response = await apiFetch(`${API_BASE}/like-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    return response.ok && Boolean(data.success);
  },

  async trackView(videoId: number): Promise<boolean> {
    const response = await apiFetch(`${API_BASE}/view-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    return response.ok && Boolean(data.success);
  },

  /**
   * Mengedit video murid (judul/durasi dan opsi file video baru).
   */
  async editVideo(
    videoId: number, 
    title: string, 
    category: string, 
    duration?: string, 
    file?: File,
    onProgress?: (percent: number) => void
  ): Promise<VideoItem> {
    if (file) {
      // Jika menyertakan file baru, gunakan XMLHttpRequest agar ada tracking progres
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('video_id', videoId.toString());
        formData.append('title', title);
        formData.append('category', category || 'Umum');
        if (duration) formData.append('duration', duration);
        formData.append('video_file', file);

        xhr.open('POST', `${API_BASE}/edit-video.php`, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        const token = getAuthToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('X-Session-Token', token);
        }

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && e.total > 0) {
              const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          let data: any;
          const contentType = xhr.getResponseHeader('content-type') || '';
          if (contentType.includes('application/json')) {
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = { message: xhr.responseText || 'Format respon server tidak valid.' };
            }
          } else {
            data = { message: xhr.responseText || `Server mengembalikan status ${xhr.status}.` };
          }

          if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            if (onProgress) onProgress(100);
            resolve(data.video);
          } else {
            reject(new Error(data.message || 'Gagal mengubah video.'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Koneksi jaringan terputus saat mengunggah video baru.'));
        };

        xhr.timeout = 300000;
        xhr.send(formData);
      });
    }

    // Jika tanpa file baru, gunakan apiFetch standar
    const formData = new FormData();
    formData.append('video_id', videoId.toString());
    formData.append('title', title);
    formData.append('category', category || 'Umum');
    if (duration) formData.append('duration', duration);

    const response = await apiFetch(`${API_BASE}/edit-video.php`, {
      method: 'POST',
      body: formData,
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah video');
    }
    return data.video;
  },

  async deleteVideo(videoId: number): Promise<boolean> {
    const response = await apiFetch(`${API_BASE}/delete-video.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus video');
    }
    return true;
  },

  async getVideoComments(videoId: number): Promise<VideoComment[]> {
    const response = await apiFetch(`${API_BASE}/get-video-comments.php?video_id=${videoId}`, {
      method: 'GET',
    });
    const data = await parseResponseSafe(response);
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil komentar video.');
    }
    return data.comments || [];
  },

  async addVideoComment(videoId: number, content: string): Promise<VideoComment> {
    const response = await apiFetch(`${API_BASE}/add-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId, content }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menambahkan komentar.');
    }
    return data.comment;
  },

  async editVideoComment(commentId: number, content: string): Promise<boolean> {
    const response = await apiFetch(`${API_BASE}/edit-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId, content }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengubah komentar.');
    }
    return true;
  },

  async deleteVideoComment(commentId: number): Promise<boolean> {
    const response = await apiFetch(`${API_BASE}/delete-video-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ comment_id: commentId }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await parseResponseSafe(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus komentar.');
    }
    return true;
  }
};
