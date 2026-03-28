import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Type } from 'lucide-react';
import clsx from 'clsx';

interface UploadAreaProps {
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onTextSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [isManual, setIsManual] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setIsManual(true);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/plain': ['.txt'], 'text/csv': ['.csv'] } 
  });

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button 
          onClick={() => setIsManual(true)} 
          className={clsx("flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2", 
            isManual ? "text-primary-600 border-b-2 border-primary-600 bg-white" : "text-slate-500 hover:text-slate-700")}
        >
          <Type size={18} /> Paste Text
        </button>
        <button 
          onClick={() => setIsManual(false)} 
          className={clsx("flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2", 
            !isManual ? "text-primary-600 border-b-2 border-primary-600 bg-white" : "text-slate-500 hover:text-slate-700")}
        >
          <UploadCloud size={18} /> Upload File
        </button>
      </div>

      <div className="p-6">
        {isManual ? (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your questions here...&#10;Example:&#10;1. What is the capital of France?&#10;A) Berlin&#10;B) Paris&#10;C) Rome&#10;D) Madrid&#10;Answer: B"
              className="w-full h-64 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !text.trim()}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isLoading ? 'Parsing...' : 'Parse MCQs'}
              </button>
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={clsx(
              "border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary-500 bg-primary-50" : "border-slate-300 hover:border-primary-400 hover:bg-slate-50"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-700 font-medium mb-1">
              Drag & drop your file here
            </p>
            <p className="text-slate-500 text-sm">
              Supports .txt and .csv formats
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
