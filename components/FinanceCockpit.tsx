import React, { useState } from 'react';
import InstrumentProcessor from './Header';
import CreditDispute from './CreditDispute';
import VehicleFinancingAnalysis from './VehicleFinancingAnalysis';
import DebtCollectorLog from './DebtCollectorLog';
import LegalResources from './LegalResources';

type Tab = 'Instrument Analysis' | 'Credit Dispute' | 'Vehicle Financing' | 'Debt Collector Log' | 'Legal Resources';

const tabs: Tab[] = [
  'Instrument Analysis',
  'Credit Dispute',
  'Vehicle Financing',
  'Debt Collector Log',
  'Legal Resources',
];

const FinanceCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Instrument Analysis');

  const renderContent = () => {
    switch (activeTab) {
      case 'Instrument Analysis':
        return <InstrumentProcessor />;
      case 'Credit Dispute':
        return <CreditDispute />;
      case 'Vehicle Financing':
        return <VehicleFinancingAnalysis />;
      case 'Debt Collector Log':
        return <DebtCollectorLog />;
      case 'Legal Resources':
        return <LegalResources />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/50 border border-slate-200 rounded-lg shadow-sm">
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap shrink-0 border-b-2 font-medium text-sm p-4
                ${
                  activeTab === tab
                    ? 'border-slate-700 text-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default FinanceCockpit;