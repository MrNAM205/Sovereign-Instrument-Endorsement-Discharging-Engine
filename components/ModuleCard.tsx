
import React from 'react';

interface ModuleCardProps {
  name: string;
  description: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ name, description }) => {
  return (
    <div className="bg-white/50 border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-shadow duration-300 h-full">
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-slate-600 mt-1">{description}</p>
    </div>
  );
};

export default ModuleCard;
