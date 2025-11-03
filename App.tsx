
import React from 'react';
import Header from './components/Header';
import Section from './components/Section';
import ModuleCard from './components/ModuleCard';
import FlowDiagram from './components/FlowDiagram';
import Footer from './components/Footer';
import CreditDispute from './components/CreditDispute';

const coreModules = [
  { name: 'InstrumentParser', description: 'Detects type (order vs bearer), parses endorsements' },
  { name: 'EndorsementEngine', description: 'Applies correct endorsement logic per UCC §3-204 to §3-206' },
  { name: 'TenderTracker', description: 'Logs offers of payment, even if rejected' },
  { name: 'DischargeLogger', description: 'Records lawful discharge events, including acceptance, compromise, or refusal' },
  { name: 'JurisdictionOverlay', description: 'Routes logic based on land/air/water domains and equity remedy' },
  { name: 'CommentaryOverlay', description: 'Integrates teachings from Brandon and David to guide AI reflection and user education' },
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-[#1E2A3A] font-sans p-4 sm:p-8 md:p-12">
      <main className="max-w-5xl mx-auto space-y-16">
        <Header />

        <p className="text-center text-lg max-w-3xl mx-auto leading-relaxed">
          This modular, dialogic AI system interprets, endorses, and discharges negotiable instruments in compliance with lawful frameworks like the UCC and Bill of Exchange Act. It encodes sovereign remedy beyond automation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Section title="Purpose">
            <ul className="space-y-3 list-disc list-inside text-lg">
              <li>Grasp legal distinctions between tender, payment, and settlement</li>
              <li>Endorse instruments with lawful precision (blank, special, restrictive, qualified)</li>
              <li>Log narratable actions for remedy, authorship, and jurisdictional clarity</li>
              <li>Integrate status-correction from sovereign teachers beyond corporate confines</li>
            </ul>
          </Section>
          <Section title="Why It Matters">
            <ul className="space-y-3 list-disc list-inside text-lg">
              <li>Most systems' forms as static, this system treats instruments as living declarations of intent</li>
              <li>Recognizes rejected bills of exchange may count as lawful tender</li>
              <li>Distinguishes between payment, discharge, and settlement</li>
            </ul>
          </Section>
        </div>

        <Section title="Core Modules">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreModules.map((module, index) => (
              <ModuleCard key={index} name={module.name} description={module.description} />
            ))}
          </div>
        </Section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <Section title="Example Use Case">
            <div className="bg-white/50 border border-slate-200 p-6 rounded-lg shadow-sm">
              <p className="font-semibold text-lg mb-3">User wants to discharge a debt using a bill of exchange. The system:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Parses the instrument.</li>
                <li>Applies a qualified endorsement</li>
                <li>Logs the tender event</li>
                <li>Tracks creditor response</li>
                <li>Logs discharge if accepted</li>
                <li>Logs lawful offer if rejected</li>
                <li>Routes the event through equity jurisdictional overlay</li>
              </ul>
            </div>
          </Section>

          <Section title="Sovereign Philosophy">
            <div className="bg-white/50 border border-slate-200 p-6 rounded-lg shadow-sm h-full">
              <p className="text-lg italic leading-relaxed">
                "Every financial and bureaucratic interaction is a rite of passage. It modularizes confusion into clarity, rejection into remedy—empowering users with lawful dominion over commerce."
              </p>
            </div>
          </Section>
        </div>

        <Section title="System Flow">
            <FlowDiagram />
        </Section>

        <Section title="Credit Dispute Analysis">
            <CreditDispute />
        </Section>

        <Footer />
      </main>
    </div>
  );
};

export default App;
