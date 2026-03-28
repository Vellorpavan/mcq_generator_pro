import React from 'react';
import type { MCQItem } from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface PreviewPanelProps {
  mcqs: MCQItem[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ mcqs }) => {
  if (mcqs.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={20} />
          Parsed Successfully
        </h2>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
          {mcqs.length} Questions Found
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {mcqs.map((mcq, idx) => {
          const answerIdx = ['A', 'B', 'C', 'D'].indexOf(mcq.correct_answer || 'A');
          
          return (
            <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
              <h3 className="text-slate-900 font-medium mb-4 flex gap-3 leading-relaxed">
                <span className="text-slate-400 font-normal shrink-0">{idx + 1}.</span>
                {mcq.question}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                {mcq.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isCorrect = optIdx === answerIdx;
                  
                  return (
                    <div 
                      key={optIdx} 
                      className={clsx(
                        "p-3 border rounded-lg flex items-center gap-3 text-sm",
                        isCorrect 
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-900" 
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      <span className={clsx(
                        "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold shrink-0",
                        isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"
                      )}>
                        {letter}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>
              
              {!['A', 'B', 'C', 'D'].includes(mcq.correct_answer || '') && (
                 <div className="mt-4 pl-6 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-md">
                   <AlertCircle size={16} /> Default answer 'A' assumed due to missing valid Answer tag.
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
