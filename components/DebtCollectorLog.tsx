import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface LogEntry {
    id: number;
    date: string;
    collectorName: string;
    company: string;
    description: string;
    violationSuggestion: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
);

const SmallLoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500"></div>
    </div>
);


const DebtCollectorLog: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [newLog, setNewLog] = useState({ date: '', collectorName: '', company: '', description: '' });
    const [violationSuggestion, setViolationSuggestion] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [ceaseAndDesist, setCeaseAndDesist] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewLog(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestViolation = async () => {
        if (!newLog.description) return;
        setIsSuggesting(true);
        setError(null);
        setViolationSuggestion('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the following description of an interaction with a debt collector, identify potential violations of the Fair Debt Collection Practices Act (FDCPA). List the specific violations and briefly explain why they might apply.
Description: "${newLog.description}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setViolationSuggestion(response.text);
        } catch (err) {
            setError("Could not get AI suggestion. Please try again.");
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: LogEntry = {
            id: Date.now(),
            ...newLog,
            violationSuggestion: violationSuggestion,
        };
        setLogs(prev => [...prev, newEntry]);
        setNewLog({ date: '', collectorName: '', company: '', description: '' });
        setViolationSuggestion('');
    };

    const handleGenerateCeaseAndDesist = async () => {
        if (logs.length === 0) return;
        setIsGenerating(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const logSummary = logs.map(log => 
                `On ${log.date}, an agent named ${log.collectorName} from ${log.company} did the following: ${log.description}. Potential FDCPA violations noted: ${log.violationSuggestion || 'N/A'}`
            ).join('\n\n');
            const prompt = `Based on the following log of interactions, draft a formal, firm, and legally sound "Cease and Desist" letter. The letter must demand that the collection agency immediately cease all communications. It should reference the pattern of behavior documented in the logs as the basis for the demand. Use placeholders like [Your Name] and [Your Address], but draft a complete, ready-to-use letter.
Log Summary:\n---\n${logSummary}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setCeaseAndDesist(response.text);

        } catch (err) {
            setError("Failed to generate Cease & Desist letter.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Letter copied to clipboard!");
    };


    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-center">FDCPA Debt Collector Log</h3>

            {/* Log Entry Form */}
            <div className="max-w-2xl mx-auto p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-lg font-bold mb-4">Log New Interaction</h4>
                <form onSubmit={handleAddLog} className="space-y-4">
                    <input type="date" name="date" value={newLog.date} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-md" />
                    <input type="text" name="collectorName" placeholder="Collector's Name" value={newLog.collectorName} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-md" />
                    <input type="text" name="company" placeholder="Collection Company" value={newLog.company} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-md" />
                    <textarea name="description" placeholder="Describe the interaction..." value={newLog.description} onChange={handleInputChange} required rows={4} className="w-full p-2 border border-slate-300 rounded-md" />
                    
                    <button type="button" onClick={handleSuggestViolation} disabled={isSuggesting || !newLog.description} className="w-full text-sm bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors disabled:bg-slate-100">
                        {isSuggesting ? 'Thinking...' : 'Suggest Violation (AI) ✨'}
                    </button>
                    
                    {isSuggesting && <SmallLoadingSpinner />}
                    {violationSuggestion && (
                        <div className="p-3 my-2 bg-slate-100 border-l-4 border-slate-400 rounded-r-lg text-sm" style={{ whiteSpace: 'pre-wrap' }}>{violationSuggestion}</div>
                    )}
                    
                    <button type="submit" className="w-full bg-[#1E2A3A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#3c5472]">Add to Log</button>
                </form>
            </div>

            {/* Display Logs */}
            <div className="space-y-4">
                <h4 className="text-lg font-bold text-center">Interaction History</h4>
                {logs.length > 0 ? (
                    logs.map(log => (
                        <div key={log.id} className="p-4 bg-white border border-slate-200 rounded-lg max-w-2xl mx-auto">
                            <p className="font-bold">{log.date} - {log.company} ({log.collectorName})</p>
                            <p className="mt-2 text-slate-700">{log.description}</p>
                            {log.violationSuggestion && <div className="mt-3 p-2 bg-amber-50 border-l-4 border-amber-400 text-sm" style={{ whiteSpace: 'pre-wrap' }}><b>AI Suggestion:</b> {log.violationSuggestion}</div>}
                        </div>
                    )).reverse()
                ) : (
                    <p className="text-center text-slate-500">No interactions logged yet.</p>
                )}
            </div>
            
            {/* Generate C&D Letter */}
            {logs.length > 0 && (
                <div className="text-center">
                    <button onClick={handleGenerateCeaseAndDesist} disabled={isGenerating} className="bg-red-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-800 transition-colors disabled:bg-slate-400">
                        {isGenerating ? 'Generating Letter...' : 'Generate Cease & Desist Letter'}
                    </button>
                </div>
            )}
            
            {isGenerating && <LoadingSpinner />}
            {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg max-w-2xl mx-auto">{error}</div>}

            {ceaseAndDesist && (
                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold">Generated Cease & Desist Letter</h3>
                    <textarea readOnly className="w-full h-96 p-3 font-mono text-sm bg-slate-50 border border-slate-300 rounded-md" value={ceaseAndDesist} />
                    <div className="text-center">
                        <button onClick={() => copyToClipboard(ceaseAndDesist)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtCollectorLog;
