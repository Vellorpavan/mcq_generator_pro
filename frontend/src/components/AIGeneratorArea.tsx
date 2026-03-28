import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, BrainCircuit, Loader2, CheckCircle2, FileText, X } from 'lucide-react';
import clsx from 'clsx';
import { extractTextFromFile } from '../services/api';

interface AIGeneratorAreaProps {
  onGenerate: (text: string, count: number) => Promise<void>;
  isGenerating: boolean;
}

export const AIGeneratorArea: React.FC<AIGeneratorAreaProps> = ({ onGenerate, isGenerating }) => {
  const [manualText, setManualText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExtractedContent = extractedText.trim().length > 0;
  const inputData = hasExtractedContent ? extractedText : manualText;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsExtracting(true);

    try {
      const extracted = await extractTextFromFile(file);
      if (extracted && extracted.trim()) {
        setExtractedText(extracted);
        setUploadedFileName(file.name);
      } else {
        setError("No text could be extracted from this PDF.");
      }
    } catch (err: any) {
      console.error("PDF extraction failed:", err);
      setError(err?.message || "Failed to extract text from PDF.");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] }
  });

  const handleClearUpload = () => {
    setExtractedText('');
    setUploadedFileName('');
    setError(null);
  };

  const handleGenerate = () => {
    if (inputData.trim() && questionCount > 0) {
      setError(null);
      onGenerate(inputData, questionCount).catch((err) => {
        console.error("Generate failed:", err);
        setError(err?.message || "Generation failed");
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center gap-3">
        <BrainCircuit className="text-indigo-600" size={24} />
        <h2 className="text-lg font-bold text-indigo-900">AI MCQ Generator</h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">1. Upload Study Material</label>
            
            {hasExtractedContent ? (
              <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl h-40 flex flex-col items-center justify-center p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-emerald-700 font-medium text-sm">PDF uploaded successfully</p>
                <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                  <FileText size={12} /> {uploadedFileName}
                </p>
                <button
                  onClick={handleClearUpload}
                  className="mt-3 text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={12} /> Remove and upload different file
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={clsx(
                  "border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                )}
              >
                <input {...getInputProps()} />
                {isExtracting ? (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                    <p className="text-indigo-600 font-medium">Extracting text...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-slate-700 font-medium text-sm">Drag & drop PDF or TXT here</p>
                    <p className="text-slate-500 text-xs mt-1">or click to browse</p>
                  </>
                )}
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {hasExtractedContent ? 'Or type/paste text manually (PDF will be used)' : 'Or Paste Text Directly'}
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste your study material here..."
                className={clsx(
                  "w-full h-32 p-3 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-xs",
                  hasExtractedContent && "opacity-60"
                )}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">2. Generation Settings</label>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Number of Questions (1-50)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    {hasExtractedContent 
                      ? `Ready to generate ${questionCount} MCQs from uploaded PDF.`
                      : `The AI will extract key concepts to formulate ${questionCount} multiple choice questions.`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isExtracting || !inputData.trim() || questionCount < 1}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating {questionCount} MCQs...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={20} />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
