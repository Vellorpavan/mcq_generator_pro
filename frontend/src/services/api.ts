import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'bypass-tunnel-reminder': 'true'
  },
});

export interface MCQItem {
  question: string;
  options: string[];
  correct_answer?: string | null;
}

export const parseMCQText = async (text: string): Promise<MCQItem[]> => {
  try {
    const response = await apiClient.post('/parse', { text });
    return response.data;
  } catch (error: any) {
    console.error("Parse error:", error);
    throw new Error(error?.response?.data?.detail || error?.message || "Failed to parse MCQs");
  }
};

export const generateDocument = async (mcqs: MCQItem[], title: string = "MCQ Assignment", mode: string = "full"): Promise<void> => {
  try {
    const response = await apiClient.post('/generate', { mcqs, title, mode }, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mcq_assignment.docx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Generate document error:", error);
    throw new Error(error?.response?.data?.detail || error?.message || "Failed to generate document");
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    console.log("Uploading file:", file.name, "Size:", file.size);
    
    if (!file || file.size === 0) {
      throw new Error("Empty file selected");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload-material', formData);
    
    console.log("Response:", response.data);
    
    if (!response.data || typeof response.data.text !== 'string') {
      throw new Error("Invalid response from server");
    }
    
    return response.data.text;
  } catch (error: any) {
    console.error("Upload error:", error);
    const message = error?.response?.data?.detail || error?.message || "Failed to extract text from PDF";
    throw new Error(message);
  }
};

export const generateAIMCQs = async (text: string, num_questions: number): Promise<MCQItem[]> => {
  try {
    const response = await apiClient.post('/generate-mcqs', { text, num_questions });
    return response.data;
  } catch (error: any) {
    console.error("AI generate error:", error);
    throw new Error(error?.response?.data?.detail || error?.message || "Failed to generate MCQs with AI");
  }
};
