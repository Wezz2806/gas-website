// Development: Vite proxy mengarahkan /api → XAMPP lokal
// Production:  VITE_API_BASE_URL diisi URL Railway
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CommentItem {
  id: number;
  student_id: number;
  author: string;
  content: string;
  created_at: string;
}

export const commentService = {
  async getComments(): Promise<CommentItem[]> {
    const response = await fetch(`${API_BASE}/get-comments.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil daftar tanggapan');
    }
    const data = await response.json();
    return data.comments || [];
  },

  async addComment(content: string): Promise<CommentItem> {
    const response = await fetch(`${API_BASE}/add-comment.php`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengirim komentar');
    }
    return data.comment;
  },

  async editComment(commentId: number, content: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/edit-comment.php`, {
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
      throw new Error(data.message || 'Gagal mengedit komentar');
    }
    return true;
  },

  async deleteComment(commentId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE}/delete-comment.php`, {
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
      throw new Error(data.message || 'Gagal menghapus komentar');
    }
    return true;
  }
};
