// src/services/assignmentService.ts
import { Assignment, AssignmentComment, AssignmentSubmission } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface AssignmentDetailResponse {
  success: boolean;
  assignment: Assignment;
  comments: AssignmentComment[];
  my_submission?: AssignmentSubmission | null;
  submissions?: AssignmentSubmission[];
  members?: Array<{ id: number; full_name: string; email: string; avatar_url: string | null }>;
}

export const assignmentService = {
  async getAssignments(roomId: number): Promise<{ assignments: Assignment[]; total_members: number }> {
    const res = await fetch(`${API_BASE}/room-assignments.php?action=list&room_id=${roomId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!res.ok) {
      throw new Error('Gagal memuat penugasan kelas');
    }

    const data = await res.json();
    return {
      assignments: data.assignments || [],
      total_members: data.total_members || 0
    };
  },

  async getAssignmentDetail(assignmentId: number): Promise<AssignmentDetailResponse> {
    const res = await fetch(`${API_BASE}/room-assignments.php?action=detail&id=${assignmentId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!res.ok) {
      throw new Error('Gagal memuat rincian penugasan');
    }

    return await res.json();
  },

  async createAssignment(formData: FormData): Promise<{ id: number; message: string }> {
    formData.append('action', 'create_assignment');
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal membuat tugas baru');
    }

    return data;
  },

  async updateAssignment(payload: { id: number; title: string; description: string; due_date: string | null; max_points: number }): Promise<void> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'update_assignment',
        ...payload
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal memperbarui tugas');
    }
  },

  async deleteAssignment(assignmentId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'delete_assignment',
        id: assignmentId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus tugas');
    }
  },

  async submitAssignment(assignmentId: number, file: File, notes?: string): Promise<{ filename: string; original_name: string }> {
    const formData = new FormData();
    formData.append('action', 'submit_assignment');
    formData.append('assignment_id', String(assignmentId));
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }

    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengumpulkan tugas');
    }

    return data;
  },

  async unsubmitAssignment(assignmentId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'unsubmit_assignment',
        assignment_id: assignmentId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal membatalkan pengumpulan tugas');
    }
  },

  async gradeSubmission(submissionId: number, grade: number | null, feedback?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'grade_submission',
        submission_id: submissionId,
        grade,
        feedback
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan nilai');
    }
  },

  async addComment(assignmentId: number, content: string): Promise<AssignmentComment> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'add_comment',
        assignment_id: assignmentId,
        content
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengirim komentar');
    }

    return data.comment;
  },

  async deleteComment(commentId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/room-assignments.php`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        action: 'delete_comment',
        comment_id: commentId
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus komentar');
    }
  }
};
