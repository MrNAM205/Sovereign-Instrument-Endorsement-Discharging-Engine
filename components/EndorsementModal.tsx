import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface EndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
);

const SmallLoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500"></div>
    </div>
);

interface ExplanationState {
    section: string;
    text: string;
    isLoading: boolean;
}

const EndorsementModal: React.FC<EndorsementModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;
  
  const [explanation, setExplanation] = useState<ExplanationState | null>(null);

  const handleExplainSection = async (section: string) => {
    // If the same section is clicked again, hide the explanation
    if (explanation?.section === section && explanation.text) {
        setExplanation(null);
        return;
    }
      
    setExplanation({ section, text: '', isLoading: true });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `In simple, clear terms for a layperson, explain the key points and implications of UCC §${section}. Focus on its relevance to an individual managing their own financial instruments.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setExplanation({ section, text: response.text, isLoading: false });
    } catch (err) {
      console.error("Explanation error:", err);
      setExplanation({ section, text: 'Failed to load explanation.', isLoading: false });
    }
  };

  const renderContentWithLinks = (text: string) => {
      if (!text) return null;
      
      const regex = /(\[UCC §\d-\d{3}\])/g;
      const parts = text.split(regex);
    
      return parts.map((part, index) => {
        const match = part.match(/\[UCC §(\d-\d{3})\]/);
        if (match) {
          const section = match[1]; // e.g., "3-205"
          const article = section.split('-')[0];
          const url = `https://www.law.cornell.edu/ucc/${article}/${section}`;
          return (
            <React.Fragment key={index}>
                <span className="inline-block my-1">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline bg-blue-50 px-1 py-0.5 rounded transition-colors"
                    >
                        {`UCC §${section}`}
                    </a>
                    <button 
                        onClick={() => handleExplainSection(section)}
                        className="ml-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2 py-1 rounded-full transition-colors"
                        title={`Explain UCC §${section} with AI`}
                    >
                        Explain with AI ✨
                    </button>
                </span>
                {explanation?.section === section && (
                    <div className="p-3 my-2 bg-slate-100 border-l-4 border-slate-400 rounded-r-lg text-base">
                        {explanation.isLoading ? <SmallLoadingSpinner /> : <div style={{ whiteSpace: 'pre-wrap' }}>{explanation.text}</div>}
                    </div>
                )}
            </React.Fragment>
          );
        }
        return <span key={index}>{part}</span>;
      });
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="endorsement-modal-title"
    >
      <div 
        className="bg-[#F9F5EC] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 id="endorsement-modal-title" className="text-2xl font-bold text-[#1E2A3A] mb-4">{title}</h2>
        <div className="text-lg text-slate-700 leading-relaxed">
          {isLoading ? <LoadingSpinner /> : <div style={{ whiteSpace: 'pre-wrap' }}>{renderContentWithLinks(content)}</div>}
        </div>
      </div>
    </div>
  );
};

export default EndorsementModal;