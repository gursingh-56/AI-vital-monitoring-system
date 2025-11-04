
import React from 'react';

interface VitalSignCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  colorClass: string;
}

const VitalSignCard: React.FC<VitalSignCardProps> = ({ icon, label, value, unit, colorClass }) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 shadow-lg flex flex-col justify-between ${colorClass}`}>
      <div className="flex items-center text-gray-300">
        {icon}
        <h3 className="font-semibold text-lg">{label}</h3>
      </div>
      <div className="text-right mt-4">
        <span className="text-4xl font-bold tracking-tight text-white">{value}</span>
        <span className="text-lg ml-2 text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

export default VitalSignCard;
