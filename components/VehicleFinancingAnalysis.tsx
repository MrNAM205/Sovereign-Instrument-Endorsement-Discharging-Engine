import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const UploadIcon: React.FC = () => (
    <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
    </div>
);

const VehicleFinancingAnalysis: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [remedyLetter, setRemedyLetter] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Unsupported file type. Please upload a PDF, JPG, or PNG file.');
                setFile(null);
                setAnalysis('');
                setRemedyLetter('');
                return;
            }

            setFile(selectedFile);
            setAnalysis('');
            setRemedyLetter('');
            setError(null);
        }
    };

    const fileToGenerativePart = (file: File) => {
        return new Promise<{inlineData: {mimeType: string; data: string}}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (!dataUrl) return reject(new Error("File could not be read."));
                const [header, base64Data] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                if (!mimeType || !base64Data) return reject(new Error("Invalid file format."));
                resolve({ inlineData: { mimeType, data: base64Data } });
            };
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsDataURL(file);
        });
    }

    const handleAnalyze = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setAnalysis('');
        setRemedyLetter('');

        try {
            const filePart = await fileToGenerativePart(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert in consumer protection law, specializing in the Truth in Lending Act (TILA) and vehicle financing contracts. Analyze the following document.
1.  **TILA Disclosure Validation:** Check for clear, conspicuous disclosures of the APR, finance charge, amount financed, and total of payments. Note any discrepancies or missing information.
2.  **Hidden Fees:** Identify any clauses that may represent hidden fees, such as excessive documentation fees, GAP insurance markups, or undisclosed add-ons.
3.  **Misrepresentation:** Look for signs of misrepresentation regarding the vehicle's condition, history, or financing terms.
4.  **Arbitration Clauses:** Note the presence and terms of any mandatory arbitration clauses.
5.  **Summary and Recommended Action:** Provide a clear, actionable summary in markdown format, outlining potential violations and suggesting a course of action.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: prompt }, filePart] }
            });
            setAnalysis(response.text);

        } catch (err) {
            console.error("Analysis error:", err);
            setError("Failed to analyze the contract. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateRemedy = async () => {
        if (!analysis) return;

        setIsGenerating(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the following contract analysis, draft a formal "Notice and Opportunity to Cure" letter to the financing company. The letter should be structured professionally and legally, referencing the potential TILA violations and other issues identified. It must clearly state the desired remedy (e.g., contract rescission, fee removal, correction of disclosures). Use placeholders like [Your Name] and [Date], but draft a complete, ready-to-use letter.`;
            
            const analysisPart = { text: `CONTRACT ANALYSIS:\n---\n${analysis}` };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: prompt }, analysisPart] }
            });

            setRemedyLetter(response.text);

        } catch (err) {
            console.error("Remedy generation error:", err);
            setError("Failed to generate the remedy letter. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert("Letter copied to clipboard!");
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4 text-center">Vehicle Financing Analysis</h3>
            
            <label htmlFor="contract-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <UploadIcon />
                <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">Upload financing contract (PDF, JPG, PNG)</p>
              </div>
            </label>
            <input id="contract-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf,image/jpeg,image/png" />

            {file && (
                <div className="text-center p-3 bg-slate-100 border border-slate-200 rounded-lg">
                   <p className="text-sm text-slate-800 font-semibold">{file.name}</p>
                </div>
            )}

            <div className="text-center">
                <button onClick={handleAnalyze} disabled={!file || isLoading} className="bg-[#1E2A3A] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#3c5472] transition-colors disabled:bg-slate-400">
                    {isLoading ? 'Analyzing Contract...' : 'Analyze Contract'}
                </button>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>}

            {analysis && (
                <div className="p-6 bg-white border border-slate-200 rounded-lg prose prose-slate max-w-none">
                   <h3 className="text-xl font-bold mb-4">Contract Analysis</h3>
                   <div style={{ whiteSpace: 'pre-wrap' }}>{analysis}</div>
                   <div className="text-center mt-6">
                        <button onClick={handleGenerateRemedy} disabled={isGenerating} className="bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition-colors disabled:bg-slate-400">
                            {isGenerating ? 'Generating Letter...' : 'Generate Remedy Letter'}
                        </button>
                   </div>
                </div>
            )}
            
            {isGenerating && <LoadingSpinner />}

            {remedyLetter && (
                <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4">
                    <h3 className="text-xl font-bold">Generated Remedy Letter</h3>
                    <textarea readOnly className="w-full h-96 p-3 font-mono text-sm bg-slate-50 border border-slate-300 rounded-md" value={remedyLetter} />
                    <div className="text-center">
                        <button onClick={() => copyToClipboard(remedyLetter)} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleFinancingAnalysis;
