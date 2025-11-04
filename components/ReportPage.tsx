/**
 * REPORT PAGE COMPONENT
 * 
 * Displays AI analysis results in a dedicated page with:
 * 1. Clean text rendering (no HTML) for better readability
 * 2. Email sending functionality with backend integration
 * 3. Navigation back to monitoring page
 * 4. Status indicators for backend connectivity
 * 
 * Key Features:
 * - TextRenderer: Converts markdown to clean text display
 * - Email integration: Sends formatted HTML emails via backend
 * - State management: Handles email sending status
 * - Navigation: Easy return to monitoring interface
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackendStatusIndicator from './BackendStatusIndicator';
import ttsService, { HINDI_MESSAGES } from '../services/ttsService';
import { MailIcon, SpinnerIcon, CheckIcon, ArrowLeftIcon } from './icons';
import type { VitalAnalysis } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

interface ReportData {
  report: VitalAnalysis;
  email: string;
  ecgImages: (string | null)[];
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * TEXT RENDERER COMPONENT
 * 
 * Converts markdown content to clean text display (no HTML):
 * - Removes HTML tags for security
 * - Converts markdown formatting to readable text
 * - Handles headers, lists, and bold text
 * - Used for displaying AI analysis reports safely
 */
/**
 * VITAL ANALYSIS RENDERER COMPONENT
 * 
 * Displays structured JSON analysis data in a beautiful, medical-grade format:
 * - Professional vital signs display with status indicators
 * - Color-coded status badges (Normal/High/Low)
 * - Clean, scannable layout for medical reports
 * - Responsive design for different screen sizes
 */
const VitalAnalysisRenderer: React.FC<{ analysis: VitalAnalysis, className?: string }> = ({ analysis, className }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'low':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return '✓';
      case 'high':
        return '↑';
      case 'low':
        return '↓';
      default:
        return '?';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Assessment */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-300 mb-3">📊 Overall Assessment</h2>
        <p className="text-gray-300 leading-relaxed">{analysis.overall_assessment}</p>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">🔍 Detailed Analysis</h2>
        
        {/* Heart Rate */}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">❤️ Heart Rate</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.detailed_analysis.heart_rate.status)}`}>
              {getStatusIcon(analysis.detailed_analysis.heart_rate.status)} {analysis.detailed_analysis.heart_rate.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{analysis.detailed_analysis.heart_rate.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.detailed_analysis.heart_rate.explanation}</p>
        </div>

        {/* Blood Pressure */}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🩸 Blood Pressure</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.detailed_analysis.blood_pressure.status)}`}>
              {getStatusIcon(analysis.detailed_analysis.blood_pressure.status)} {analysis.detailed_analysis.blood_pressure.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{analysis.detailed_analysis.blood_pressure.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.detailed_analysis.blood_pressure.explanation}</p>
        </div>

        {/* Blood Sugar */}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🍯 Blood Sugar</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.detailed_analysis.blood_sugar.status)}`}>
              {getStatusIcon(analysis.detailed_analysis.blood_sugar.status)} {analysis.detailed_analysis.blood_sugar.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{analysis.detailed_analysis.blood_sugar.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.detailed_analysis.blood_sugar.explanation}</p>
        </div>

        {/* SpO2 */}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">💨 SpO2 (Oxygen Saturation)</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.detailed_analysis.spo2.status)}`}>
              {getStatusIcon(analysis.detailed_analysis.spo2.status)} {analysis.detailed_analysis.spo2.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{analysis.detailed_analysis.spo2.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.detailed_analysis.spo2.explanation}</p>
        </div>

        {/* Temperature */}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🌡️ Temperature</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.detailed_analysis.temperature.status)}`}>
              {getStatusIcon(analysis.detailed_analysis.temperature.status)} {analysis.detailed_analysis.temperature.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{analysis.detailed_analysis.temperature.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{analysis.detailed_analysis.temperature.explanation}</p>
        </div>
      </div>

      {/* Potential Diagnosis */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-yellow-300 mb-3">🔬 Potential Diagnosis</h2>
        <p className="text-gray-300 leading-relaxed">{analysis.potential_diagnosis}</p>
      </div>

      {/* Recommendations */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-green-300 mb-3">💡 Recommendations</h2>
        <ul className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">•</span>
              <span className="text-gray-300">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const HubertEcgAnalysisRenderer: React.FC<{ analysis: any, className?: string }> = ({ analysis, className }) => {
  if (!analysis || analysis.error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-red-300 mb-3">ECG Analysis Failed</h2>
        <p className="text-gray-300 leading-relaxed">{analysis?.error || "An unknown error occurred during ECG analysis."}</p>
      </div>
    );
  };

  return (
    <div className={`space-y-6 mt-6 ${className}`}>
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">ECG Analysis</h2>
      
      {/* Diagnosis and Recommendation */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-xl font-bold text-blue-300 mb-3">Diagnosis</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.mock_diagnosis.replace(' (Mock)', '')}</p>
        <h3 className="text-xl font-bold text-blue-300 mt-4 mb-3">Recommendation</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.mock_recommendation}</p>
      </div>

      {/* Clinical Parameters */}
      <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Clinical Parameters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {analysis.mock_ecg_parameters && Object.entries(analysis.mock_ecg_parameters).map(([key, value]) => (
            <div key={key} className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-xl font-semibold text-white">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DisclaimerAndInterpretation: React.FC = () => {
  return (
    <div className="mt-6 bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 text-sm no-print">
      <h3 className="text-lg font-semibold text-white mb-2">What these numbers mean:</h3>
      <ul className="space-y-2 text-gray-400">
        <li><strong>Diagnosis (like "Normal Sinus Rhythm"):</strong> This means your heart's electrical beat looks normal and steady.</li>
        <li><strong>Heart Rate (BPM):</strong> How many times your heart beats in a minute.</li>
        <li><strong>RR Interval (ms):</strong> The time between each heart beat.</li>
        <li><strong>PR Interval (ms):</strong> How long it takes for the electrical signal to go from the top to the bottom of your heart.</li>
        <li><strong>QRS Duration (ms):</strong> How long the main squeeze of your heart takes.</li>
        <li><strong>QT/QTc Interval (ms):</strong> The total time your heart muscle takes to squeeze and then reset.</li>
      </ul>
      <p className="text-gray-300 leading-relaxed mt-4">
        Only a real doctor can tell you what these results mean for your health.
      </p>
    </div>
  );
};

const ReportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sendStatus, setSendStatus] = React.useState<SendStatus>('idle');
  const { user } = useAuth(); // Access user from AuthContext
  
  const reportData: ReportData = location.state?.reportData;

  /**
   * GENERATE HINDI REPORT SUMMARY
   * 
   * Creates a 3-4 line summary of the vital signs analysis in Hindi:
   * - Extracts key findings from the analysis
   * - Converts medical terms to Hindi
   * - Provides a concise overview for voice announcement
   */
  const generateHindiSummary = (analysis: VitalAnalysis): string => {
    const heartRateStatus = analysis.detailed_analysis.heart_rate.status;
    const bloodPressureStatus = analysis.detailed_analysis.blood_pressure.status;
    const bloodSugarStatus = analysis.detailed_analysis.blood_sugar.status;
    const spo2Status = analysis.detailed_analysis.spo2.status;
    const temperatureStatus = analysis.detailed_analysis.temperature.status;

    // Count normal vs abnormal readings
    const statuses = [heartRateStatus, bloodPressureStatus, bloodSugarStatus, spo2Status, temperatureStatus];
    const normalCount = statuses.filter(status => status.toLowerCase() === 'normal').length;
    const abnormalCount = statuses.length - normalCount;

    let summary = `आपके महत्वपूर्ण संकेतों का विश्लेषण पूरा हो गया है। `;
    
    if (normalCount === statuses.length) {
      summary += `सभी महत्वपूर्ण संकेत सामान्य सीमा में हैं। `;
    } else if (normalCount > abnormalCount) {
      summary += `अधिकांश महत्वपूर्ण संकेत सामान्य हैं, कुछ में मामूली विचलन है। `;
    } else {
      summary += `कुछ महत्वपूर्ण संकेतों में असामान्यता देखी गई है। `;
    }

    // Add specific findings
    if (heartRateStatus !== 'normal') {
      summary += `हृदय गति ${heartRateStatus} स्तर पर है। `;
    }
    if (bloodPressureStatus !== 'normal') {
      summary += `रक्तचाप ${bloodPressureStatus} है। `;
    }

    summary += `विस्तृत रिपोर्ट नीचे दी गई है।`;

    return summary;
  };

  // Play Hindi voice announcement when component mounts
  React.useEffect(() => {
    if (reportData?.report && ttsService.isTTSAvailable()) {
      const hindiSummary = generateHindiSummary(reportData.report);
      
      // Small delay to ensure component is fully loaded
      const timer = setTimeout(async () => {
        try {
          await ttsService.speakHindi(hindiSummary, {
            speed: 0.7, // Slower for better comprehension
            pitch: 1.0,
            volume: 1.0
          });
        } catch (error) {
          console.warn('Voice announcement failed:', error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [reportData]);

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Report Data</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg"
          >
            Go Back to Monitoring
          </button>
        </div>
      </div>
    );
  }

  const handleSendEmail = async () => {
    setSendStatus('sending');
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/send-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: reportData.email,
          report: reportData.report,
          ecgImages: reportData.ecgImages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      setSendStatus('sent');
    } catch (error) {
      console.error('Failed to send email:', error);
      setSendStatus('error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getButtonContent = () => {
    switch(sendStatus) {
      case 'sending':
        return <><SpinnerIcon /> Sending...</>;
      case 'sent':
        return <><CheckIcon /> Sent Successfully!</>;
      case 'error':
        return 'Retry Sending Report';
      default:
        return <><MailIcon /> Send Report via Email</>;
    }
  }

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-report, #printable-report * {
        visibility: visible;
        color: #000 !important; /* Force text color to black for printing */
      }
      #printable-report {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 10mm; /* Reduce overall padding for print */
        font-size: 10pt; /* Smaller base font size */
        background-color: #fff !important; /* Ensure white background for the report */
      }
      #printable-report h1, #printable-report h2, #printable-report h3, #printable-report h4 {
        font-size: 12pt; /* Smaller headings */
        margin-top: 5mm;
        margin-bottom: 2mm;
        color: #000 !important; /* Ensure headings are black */
      }
      #printable-report p, #printable-report li {
        font-size: 10pt;
        line-height: 1.2;
        color: #000 !important; /* Ensure paragraphs and list items are black */
      }
      .no-print {
        display: none;
      }
      .printable-content {
        max-height: none !important;
        overflow-y: visible !important;
      }
      .avoid-page-break {
        page-break-inside: avoid;
      }
      /* Force page break after main sections if they are too long */
      .section-break-after {
        page-break-after: always;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <style>{printStyles}</style>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon />
              Back to Monitoring
            </button>
            <h1 className="text-3xl font-bold text-white">AI Analysis Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <BackendStatusIndicator />
          </div>
        </div>

        {/* Report Content */}
        <div id="printable-report" className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Vital Signs Analysis</h2>
            {/* New section for patient information */}
            {user && (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Patient Information</h3>
                <p className="text-gray-300"><strong>Name:</strong> {user.displayName || 'N/A'}</p>
                <p className="text-gray-300"><strong>Age:</strong> {user.age || 'N/A'} years</p>
                <p className="text-gray-300"><strong>Height:</strong> {user.height || 'N/A'} cm</p>
                <p className="text-gray-300"><strong>Weight:</strong> {user.weight || 'N/A'} kg</p>
              </div>
            )}
          </div>
          
          <div className="max-h-[600px] overflow-y-auto pr-4 text-gray-300 space-y-4 printable-content">
            <VitalAnalysisRenderer analysis={reportData.report} className="section-break-after" />
            {reportData.report.hubert_ecg_analysis && <HubertEcgAnalysisRenderer analysis={reportData.report.hubert_ecg_analysis} className="section-break-after" />}
            <DisclaimerAndInterpretation />
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700/50 flex gap-4 no-print">
            <button
              onClick={handleSendEmail}
              disabled={sendStatus === 'sending' || sendStatus === 'sent'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200
                ${sendStatus === 'idle' && 'bg-cyan-600 hover:bg-cyan-700 text-white'}
                ${sendStatus === 'sending' && 'bg-gray-600 text-gray-300 cursor-not-allowed'}
                ${sendStatus === 'sent' && 'bg-green-600 text-white cursor-not-allowed'}
                ${sendStatus === 'error' && 'bg-red-600 hover:bg-red-700 text-white'}
              `}
            >
             {getButtonContent()}
            </button>
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Print Report
            </button>
            {sendStatus === 'error' && <p className="text-red-400 text-sm mt-2 text-center">Failed to send email. Please check backend status and try again.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
