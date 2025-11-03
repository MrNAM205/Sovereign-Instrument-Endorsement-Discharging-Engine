
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

const CreditDispute: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [affidavit, setAffidavit] = useState<string>('');
  const [isGeneratingAffidavit, setIsGeneratingAffidavit] = useState<boolean>(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      const allowedTypes = ['text/plain', 'application/pdf'];
      
      if (!allowedTypes.includes(selectedFile.type)) {
          setError('Unsupported file type. Please upload a .txt or .pdf file.');
          setFile(null);
          setAnalysis('');
          setAffidavit('');
          return;
      }

      setFile(selectedFile);
      setAnalysis('');
      setAffidavit('');
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysis('');
    setAffidavit('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
            throw new Error("File is empty or could not be read.");
        }

        const [header, base64Data] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];

        if (!mimeType || !base64Data) {
            throw new Error("Invalid file format.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are an expert in sovereign law, the UCC, and credit reporting laws like the FCRA. Analyze the following credit report document. Identify potential inaccuracies, unverifiable items, and opportunities for lawful dispute. For each item you identify, explain the basis for the dispute from a sovereign perspective and suggest a brief course of action. Format your response in clear, actionable markdown.`;

        const filePart = {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        };

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: { parts: [{text: prompt}, filePart] },
        });

        setAnalysis(response.text);

      } catch (err) {
        console.error("Analysis error:", err);
        setError("Failed to analyze the credit report. The file may be in an unsupported format or there was an issue with the AI service. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file. Please ensure it is a valid file.");
        setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleGenerateAffidavit = async () => {
    if (!analysis || !file) return;

    setIsGeneratingAffidavit(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const dataUrl = e.target?.result as string;
            if (!dataUrl) {
                throw new Error("File could not be re-read for affidavit generation.");
            }
            const [header, base64Data] = dataUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the original credit report and the following analysis, draft a formal, legally structured Affidavit of Truth. The affidavit should clearly state the identified inaccuracies as facts asserted by the affiant. It should be written from a sovereign perspective, ready for the user to copy, notarize, and send as a lawful dispute instrument. Do not include placeholder brackets for personal info like name or address; instead, use placeholders like [Your Name] or [Your Address].`;

            const filePart = {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            };
            const analysisPart = {
                text: `PREVIOUS ANALYSIS:\n---\n${analysis}`
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{text: prompt}, analysisPart, filePart] },
            });

            setAffidavit(response.text);
        } catch (err) {
            console.error("Affidavit generation error:", err);
            setError("Failed to generate the affidavit. Please try again.");
        } finally {
            setIsGeneratingAffidavit(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
      if (affidavit) {
          navigator.clipboard.writeText(affidavit);
          alert("Affidavit copied to clipboard!");
      }
  }


  return (
    <div className="bg-white/50 border border-slate-200 p-6 rounded-lg shadow-sm space-y-6">
      <div>
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <UploadIcon />
            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500">Upload your credit report (.txt or .pdf)</p>
          </div>
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.pdf" />
      </div>

      {file && (
        <div className="text-center p-3 bg-slate-100 border border-slate-200 rounded-lg">
           <p className="text-sm text-slate-800 font-semibold">{file.name}</p>
           <p className="text-xs text-slate-500">
               Type: {file.type} | Size: {(file.size / 1024).toFixed(2)} KB
           </p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className="bg-[#1E2A3A] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#3c5472] transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Credit Report'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>}
      
      {analysis && (
        <div className="p-6 bg-white border border-slate-200 rounded-lg prose prose-slate max-w-none">
           <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
           <div style={{ whiteSpace: 'pre-wrap' }}>{analysis}</div>
           
           <div className="text-center mt-6">
                <button
                    onClick={handleGenerateAffidavit}
                    disabled={isGeneratingAffidavit}
                    className="bg-green-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                    {isGeneratingAffidavit ? 'Generating...' : 'Generate Dispute Affidavit'}
                </button>
           </div>
        </div>
      )}

      {isGeneratingAffidavit && <LoadingSpinner />}

      {affidavit && (
          <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-4">
              <h3 className="text-xl font-bold">Generated Dispute Affidavit</h3>
              <textarea
                readOnly
                className="w-full h-96 p-3 font-mono text-sm bg-slate-50 border border-slate-300 rounded-md"
                value={affidavit}
              />
              <div className="text-center">
                <button
                    onClick={copyToClipboard}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Copy to Clipboard
                </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default CreditDispute;
