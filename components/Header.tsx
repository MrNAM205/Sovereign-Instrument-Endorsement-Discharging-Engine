
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

const InstrumentProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(selectedFile.type)) {
          setError('Unsupported file type. Please upload a .jpg, .png, or .pdf file.');
          setFile(null);
          setAnalysis('');
          return;
      }

      setFile(selectedFile);
      setAnalysis('');
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysis('');

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
        const prompt = `You are an expert in sovereign law and the Uniform Commercial Code (UCC). Analyze the following image or document of a negotiable instrument. Identify the following details and format your response in clear, actionable markdown:
1.  **Instrument Type:** Is it a promissory note, bill of exchange, check, etc.? Is it an order or bearer instrument?
2.  **Parties Involved:** Identify the Drawer, Drawee, Payee, and any Endorsers.
3.  **Key Information:** Extract the amount, date of issue, and any due dates.
4.  **Endorsements:** Describe any endorsements present on the instrument (front or back). Classify them (Blank, Special, Restrictive, Qualified) according to the UCC.
5.  **Negotiability:** Briefly assess its negotiability under UCC Article 3.
6.  **Suggested Action:** Based on the analysis, what is the next logical step for the holder of this instrument?`;

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
        setError("Failed to analyze the instrument. The file may be in an unsupported format or there was an issue with the AI service. Please try again.");
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
  
  return (
    <section className="bg-white/50 border border-slate-200 p-6 rounded-lg shadow-sm space-y-6">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-center">
        Upload Instrument for Analysis
      </h2>
      <div className="max-w-xl mx-auto">
        <label htmlFor="instrument-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <UploadIcon />
            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500">Upload your instrument (.png, .jpg, or .pdf)</p>
          </div>
        </label>
        <input id="instrument-upload" name="instrument-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png,image/jpeg,application/pdf" />
      </div>

      {file && (
        <div className="text-center p-3 bg-slate-100 border border-slate-200 rounded-lg max-w-xl mx-auto">
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
          {isLoading ? 'Parsing...' : 'Parse Instrument'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <div className="p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg max-w-xl mx-auto">{error}</div>}
      
      {analysis && (
        <div className="p-6 bg-white border border-slate-200 rounded-lg prose prose-slate max-w-none mt-8">
           <h3 className="text-xl font-bold mb-4">Instrument Analysis</h3>
           <div style={{ whiteSpace: 'pre-wrap' }}>{analysis}</div>
        </div>
      )}
    </section>
  );
};

export default InstrumentProcessor;
