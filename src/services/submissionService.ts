// Development: Vite proxy mengarahkan /api → XAMPP lokal
// Production:  VITE_API_BASE_URL diisi URL Railway
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SubmissionInfo {
  id: number;
  filename: string;
  original_name: string;
  status: 'pending' | 'graded';
  submitted_at: string;
}

export const submissionService = {
  async getSubmissions(): Promise<Record<string, SubmissionInfo>> {
    const response = await fetch(`${API_BASE}/get-submissions.php`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil data pengumpulan');
    }
    const data = await response.json();
    return data.submissions || {};
  },

  async uploadSubmission(meetingId: string, file: File): Promise<SubmissionInfo> {
    const formData = new FormData();
    formData.append('meeting_id', meetingId);
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload-submission.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengunggah file LKM');
    }
    return data.submission;
  },

  async deleteSubmission(meetingId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/delete-submission.php`, {
      method: 'POST',
      body: JSON.stringify({ meeting_id: meetingId }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menghapus file LKM');
    }
    return true;
  }
};
