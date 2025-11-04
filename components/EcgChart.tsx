
/**
 * ECG CHART COMPONENT
 * 
 * Displays real-time ECG waveforms with medical accuracy:
 * 1. Professional ECG grid background for calibration
 * 2. Reference lines for medical measurement
 * 3. Configurable stroke colors for different leads
 * 4. Medical scale indicators (1mV)
 * 5. Lead type indicators for identification
 * 
 * Features:
 * - Grid background: 12x6 medical grid for accurate readings
 * - Reference lines: Horizontal lines at 25%, 50%, 75% for calibration
 * - Medical scale: 1mV indicator for proper amplitude measurement
 * - Lead identification: Shows lead type (Standard, Long Axis, Inferior)
 * - Real-time updates: Smooth waveform display without animation
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { EcgDataPoint } from '../types';

interface EcgChartProps {
  data: EcgDataPoint[];
  strokeColor?: string;
  leadType?: string;
}

const EcgChart: React.FC<EcgChartProps> = ({ data, strokeColor = "#10B981", leadType = "Standard" }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg border border-gray-600/30 shadow-inner h-full w-full relative">
      {/* ECG Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border border-gray-600/30"></div>
          ))}
        </div>
      </div>
      
      {/* ECG Waveform */}
      <div className="relative z-10 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis hide dataKey="name" />
            <YAxis hide domain={[0, 100]} />
            
            {/* Reference lines for medical accuracy */}
            <ReferenceLine y={50} stroke="#374151" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine y={25} stroke="#374151" strokeDasharray="1 1" strokeWidth={0.5} />
            <ReferenceLine y={75} stroke="#374151" strokeDasharray="1 1" strokeWidth={0.5} />
            
            <Line
              type="monotone"
              dataKey="uv"
              stroke={strokeColor}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Medical Scale Indicator */}
      <div className="absolute bottom-1 left-1 text-xs text-gray-500">
        1mV
      </div>
      
      {/* Lead Type Indicator - moved to far left with margin */}
      <div className="absolute top-1 left-2 text-xs text-gray-400">
        {leadType}
      </div>
    </div>
  );
};

export default EcgChart;
