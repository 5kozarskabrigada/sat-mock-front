import axios from 'axios';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function withApiPrefix(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return `${trimmed}/api`;
}

const API_BASE_URL = withApiPrefix(RAW_API_URL);

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url || '';
    const isAuthRequest = /\/auth\/(login|register)$/.test(requestUrl);

    if (status === 401 && !isAuthRequest) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (identifier: string, password: string) =>
    apiClient.post('/auth/login', { identifier, password }),
  
  register: (email: string, password: string, role?: string) =>
    apiClient.post('/auth/register', { email, password, role }),
  
  getCurrentUser: () => apiClient.get('/users/me'),
};

// Users API
export const usersAPI = {
  getAll: (filters?: { role?: string }) =>
    apiClient.get('/users', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/users/${id}`),
  
  create: (data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
  }) => apiClient.post('/users', data),
  
  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Exams API
export const examsAPI = {
  getAll: (filters?: { status?: string; classroomId?: string }) =>
    apiClient.get('/exams', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/exams/${id}`),
  
  create: (data: any) => apiClient.post('/exams', data),
  
  update: (id: string, data: any) => apiClient.put(`/exams/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/exams/${id}`),

  permanentDelete: (id: string) => apiClient.delete(`/exams/${id}/permanent`),
  
  restore: (id: string) => apiClient.post(`/exams/${id}/restore`),
  
  getDeleted: () => apiClient.get('/exams/deleted'),
};

// Questions API
export const questionsAPI = {
  getByExam: (examId: string) => apiClient.get(`/questions/exam/${examId}`),
  
  getById: (id: string) => apiClient.get(`/questions/${id}`),
  
  create: (data: any) => apiClient.post('/questions', data),
  
  createBulk: (examId: string, questions: any[]) =>
    apiClient.post('/questions/bulk', { examId, questions }),

  reorderByExam: (examId: string, data: { section: string; module: number; questionIdsInOrder: string[] }) =>
    apiClient.put(`/questions/exam/${examId}/reorder`, data),
  
  update: (id: string, data: any) => apiClient.put(`/questions/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/questions/${id}`),

  restore: (id: string) => apiClient.post(`/questions/${id}/restore`),

  permanentDelete: (id: string) => apiClient.delete(`/questions/${id}/permanent`),

  getDeleted: () => apiClient.get('/questions/deleted'),
};

// Student Exams API
export const studentExamsAPI = {
  start: (examId: string) => apiClient.post('/student-exams/start', { examId }),
  
  getMyExams: (filters?: { status?: string }) =>
    apiClient.get('/student-exams/my-exams', { params: filters }),
  
  getById: (id: string) => apiClient.get(`/student-exams/${id}`),
  
  getAnswers: (id: string) => apiClient.get(`/student-exams/${id}/answers`),
  
  saveAnswer: (id: string, questionId: string, answerValue: string) =>
    apiClient.post(`/student-exams/${id}/answer`, { questionId, answerValue }),
  
  saveAnswersBatch: (id: string, answers: Array<{ questionId: string; answerValue: string }>) =>
    apiClient.post(`/student-exams/${id}/answers-batch`, { answers }),
  
  complete: (id: string) => apiClient.post(`/student-exams/${id}/complete`),
  
  recordViolation: (id: string) =>
    apiClient.post(`/student-exams/${id}/lockdown-violation`),
  
  getExamResults: (examId: string) =>
    apiClient.get(`/student-exams/exam/${examId}/results`),
  
  getExamParticipation: (examId: string) =>
    apiClient.get(`/student-exams/exam/${examId}/participation`),
};

// Classrooms API
export const classroomsAPI = {
  getAll: () => apiClient.get('/classrooms'),
  
  getById: (id: string) => apiClient.get(`/classrooms/${id}`),
  
  getStudents: (id: string) => apiClient.get(`/classrooms/${id}/students`),
  
  create: (data: any) => apiClient.post('/classrooms', data),
  
  update: (id: string, data: any) => apiClient.put(`/classrooms/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/classrooms/${id}`),
  
  addStudent: (id: string, studentId: string) =>
    apiClient.post(`/classrooms/${id}/students`, { studentId }),
  
  removeStudent: (id: string, studentId: string) =>
    apiClient.delete(`/classrooms/${id}/students/${studentId}`),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (filters?: { userId?: string; examId?: string; type?: string }) =>
    apiClient.get('/activity-logs', { params: filters }),
  
  create: (data: any) => apiClient.post('/activity-logs', data),
};

// Usage API
export const usageAPI = {
  getPerStudentUsage: (from?: string, to?: string) =>
    apiClient.get('/admin/usage/per-student', { params: { from, to } }),
  
  getUsageSummary: (from?: string, to?: string) =>
    apiClient.get('/admin/usage/summary', { params: { from, to } }),
};
