import React, { useState } from 'react';
import { UploadArea } from '../components/UploadArea';
import { AIGeneratorArea } from '../components/AIGeneratorArea';
import { PreviewPanel } from '../components/PreviewPanel';
import { parseMCQText, generateDocument, generateAIMCQs } from '../services/api';
import type { MCQItem } from '../services/api';
import { FileText, Download, Loader2, BrainCircuit, Type } from 'lucide-react';
import clsx from 'clsx';

export const Home: React.FC = () => {
  const [mcqs, setMcqs] = useState<MCQItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');

  const handleParseText = async (text: string) => {
    try {
      setIsParsing(true);
      setError(null);
      const parsedData = await parseMCQText(text);
      if (parsedData.length === 0) {
        setError("Could not find any matched MCQs. Please check the format.");
      }
      setMcqs(parsedData);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred while parsing.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleAIGenerate = async (text: string, count: number) => {
    try {
      setIsParsing(true);
      setError(null);
      const generatedData = await generateAIMCQs(text, count);
      
      if (!generatedData || generatedData.length === 0) {
        setError("AI Generation completed but no MCQs were returned.");
      } else {
        setMcqs(generatedData);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred while generating with AI.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerate = async (mode: 'full' | 'no_answers' | 'key') => {
    try {
      setIsGenerating(true);
      setError(null);
      await generateDocument(mcqs, "MCQ Assignment Document", mode);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate document.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            MCQ Generator <span className="text-primary-600 font-black">Pro</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Generate high-quality MCQs from your study materials using AI, or manually parse existing text into formatted Word documents instantly.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button
              onClick={() => setActiveMode('ai')}
              className={clsx(
                "px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all",
                activeMode === 'ai' 
                  ? "bg-indigo-600 text-white shadow" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <BrainCircuit size={18} /> AI Generate
            </button>
            <button
              onClick={() => setActiveMode('manual')}
              className={clsx(
                "px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all",
                activeMode === 'manual' 
                  ? "bg-primary-600 text-white shadow" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Type size={18} /> Manual Parse
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <strong>Error: </strong>{error}
          </div>
        )}

        {/* Dynamic Component Area */}
        {activeMode === 'ai' ? (
          <AIGeneratorArea onGenerate={handleAIGenerate} isGenerating={isParsing} />
        ) : (
          <UploadArea onTextSubmit={handleParseText} isLoading={isParsing} />
        )}

        {/* Preview & Action Panel */}
        {mcqs.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PreviewPanel mcqs={mcqs} />
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 pb-12 w-full max-w-3xl mx-auto">
              <button
                onClick={() => handleGenerate('full')}
                disabled={isGenerating}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                <span className="text-sm">With Answers</span>
              </button>
              
              <button
                onClick={() => handleGenerate('no_answers')}
                disabled={isGenerating}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                <span className="text-sm">Questions Only</span>
              </button>
              
              <button
                onClick={() => handleGenerate('key')}
                disabled={isGenerating}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                <span className="text-sm">Answer Key Only</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
