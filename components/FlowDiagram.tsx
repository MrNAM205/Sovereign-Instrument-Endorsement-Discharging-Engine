import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import EndorsementModal from './EndorsementModal';

const ArrowDown: React.FC = () => (
  <div className="flex justify-center items-center my-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
);

const FlowBox: React.FC<{ title: string; items?: string[]; children?: React.ReactNode; className?: string }> = ({ title, items, children, className }) => (
    <div className={`bg-white border-2 border-slate-300 rounded-lg shadow-sm p-4 text-center ${className}`}>
        <h3 className="font-bold">{title}</h3>
        {items && (
            <ul className="mt-2 text-sm text-slate-600">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        )}
        {children}
    </div>
);


const EndorsementButton: React.FC<{ name: string, onClick: () => void }> = ({ name, onClick }) => (
    <div className="bg-slate-100 p-2 rounded flex flex-col items-center justify-center">
        <span>{name}</span>
        <button onClick={onClick} className="text-xs text-blue-600 hover:underline mt-1">Learn More</button>
    </div>
);


const FlowDiagram: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEndorsement, setSelectedEndorsement] = useState<string | null>(null);
  const [endorsementExplanation, setEndorsementExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleLearnMore = async (endorsementType: string) => {
    setSelectedEndorsement(endorsementType);
    setIsModalOpen(true);
    setIsLoading(true);
    setError(null);
    setEndorsementExplanation('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Explain a '${endorsementType}' endorsement on a negotiable instrument according to the UCC. What are its implications, and where is it physically placed on the instrument? Explain it clearly and concisely for someone studying sovereign remedy. When you reference a UCC section, please wrap it in square brackets, for example: [UCC §3-205].`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setEndorsementExplanation(response.text);
    } catch (err) {
      console.error("Gemini API error:", err);
      setError('Failed to load explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEndorsement(null);
    setEndorsementExplanation('');
    setError(null);
  }

  const endorsementTypes = ['Blank', 'Special', 'Restrictive', 'Qualified'];

  return (
    <>
      <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-lg border border-slate-200">
        <FlowBox title="Instrument Intake" />
        <ArrowDown />
        <FlowBox title="Parse Type: Bearer / Order" />
        <ArrowDown />
        <FlowBox title="Endorsement Engine" className="w-full sm:w-2/3 md:w-1/2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
            {endorsementTypes.map(type => (
              <EndorsementButton key={type} name={type} onClick={() => handleLearnMore(type)} />
            ))}
          </div>
        </FlowBox>
        <ArrowDown />
        <FlowBox title="Tender Tracker" items={['Offer Logged', 'Rejection Noted']} />
        <ArrowDown />
        <FlowBox title="Discharge Logger" items={['Accepted → Discharged', 'Rejected → Tender Preserved', 'Compromised → Settled']} />
        <ArrowDown />
        <FlowBox title="Jurisdiction Overlay" className="w-full sm:w-2/3 md:w-1/2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
              <div className="bg-amber-100 p-2 rounded">Land → Common Law</div>
              <div className="bg-sky-100 p-2 rounded">Air → Trust Law</div>
              <div className="bg-blue-100 p-2 rounded">Water → Contract Law</div>
              <div className="bg-green-100 p-2 rounded">Equity → Remedy Path</div>
          </div>
        </FlowBox>
        <ArrowDown />
        <FlowBox title="Commentary Overlay" items={['Brandon Joe Williams', 'David Straight']} />
      </div>
      {isModalOpen && selectedEndorsement && (
        <EndorsementModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`${selectedEndorsement} Endorsement`}
          content={error || endorsementExplanation}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default FlowDiagram;