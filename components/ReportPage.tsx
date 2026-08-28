import v from"react";import{useLocation as C,useNavigate as E}from"react-router-dom";import I from"html2canvas";import H from"jspdf";import P from"./BackendStatusIndicator";import w from"../services/ttsService";import{MailIcon as T,SpinnerIcon as D,CheckIcon as $,ArrowLeftIcon as L,FileTextIcon as F}from"./icons";import{useAuth as G}from"../contexts/AuthContext";import{BACKEND_URL as B}from"../services/apiConfig";const M=({analysis:e,className:g})=>{const r=l=>{switch(l.toLowerCase()){case"normal":return"bg-green-500/20 text-green-300 border-green-500/50";case"high":return"bg-red-500/20 text-red-300 border-red-500/50";case"low":return"bg-yellow-500/20 text-yellow-300 border-yellow-500/50";default:return"bg-gray-500/20 text-gray-300 border-gray-500/50"}},n=l=>{switch(l.toLowerCase()){case"normal":return"\u2713";case"high":return"\u2191";case"low":return"\u2193";default:return"?"}};return<div className={`space-y-6 ${g}`}>
      {}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-300 mb-3">📊 Overall Assessment</h2>
        <p className="text-gray-300 leading-relaxed">{e.overall_assessment}</p>
      </div>

      {}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">🔍 Detailed Analysis</h2>

        {}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">❤️ Heart Rate</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r(e.detailed_analysis.heart_rate.status)}`}>
              {n(e.detailed_analysis.heart_rate.status)} {e.detailed_analysis.heart_rate.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{e.detailed_analysis.heart_rate.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{e.detailed_analysis.heart_rate.explanation}</p>
        </div>

        {}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🩸 Blood Pressure</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r(e.detailed_analysis.blood_pressure.status)}`}>
              {n(e.detailed_analysis.blood_pressure.status)} {e.detailed_analysis.blood_pressure.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{e.detailed_analysis.blood_pressure.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{e.detailed_analysis.blood_pressure.explanation}</p>
        </div>

        {}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🍯 Blood Sugar</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r(e.detailed_analysis.blood_sugar.status)}`}>
              {n(e.detailed_analysis.blood_sugar.status)} {e.detailed_analysis.blood_sugar.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{e.detailed_analysis.blood_sugar.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{e.detailed_analysis.blood_sugar.explanation}</p>
        </div>

        {}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">💨 SpO2 (Oxygen Saturation)</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r(e.detailed_analysis.spo2.status)}`}>
              {n(e.detailed_analysis.spo2.status)} {e.detailed_analysis.spo2.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{e.detailed_analysis.spo2.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{e.detailed_analysis.spo2.explanation}</p>
        </div>

        {}
        <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">🌡️ Temperature</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${r(e.detailed_analysis.temperature.status)}`}>
              {n(e.detailed_analysis.temperature.status)} {e.detailed_analysis.temperature.status}
            </span>
          </div>
          <p className="text-cyan-400 font-medium mb-2">{e.detailed_analysis.temperature.value}</p>
          <p className="text-gray-300 text-sm leading-relaxed">{e.detailed_analysis.temperature.explanation}</p>
        </div>
      </div>

      {}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-yellow-300 mb-3">🔬 Potential Diagnosis</h2>
        <p className="text-gray-300 leading-relaxed">{e.potential_diagnosis}</p>
      </div>

      {}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-green-300 mb-3">💡 Recommendations</h2>
        <ul className="space-y-2">
          {e.recommendations.map((l,y)=><li key={y}className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">•</span>
              <span className="text-gray-300">{l}</span>
            </li>)}
        </ul>
      </div>
    </div>},O=({analysis:e,className:g})=>!e||e.error?<div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-red-300 mb-3">ECG Analysis Failed</h2>
        <p className="text-gray-300 leading-relaxed">{e?.error||"An unknown error occurred during ECG analysis."}</p>
      </div>:<div className={`space-y-6 mt-6 ${g}`}>
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">ECG Analysis</h2>

      {}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-xl font-bold text-blue-300 mb-3">Heuristic Finding</h3>
        <p className="text-gray-300 leading-relaxed">{e.diagnosis||"N/A"}</p>
        <h3 className="text-xl font-bold text-blue-300 mt-4 mb-3">Recommendation</h3>
        <p className="text-gray-300 leading-relaxed">{e.recommendation||"N/A"}</p>
      </div>

      {}
      {e.disclaimer&&<div className="bg-amber-900/20 border border-amber-500/40 rounded-lg p-4">
          <p className="text-amber-200 text-sm leading-relaxed">⚠️ {e.disclaimer}</p>
        </div>}

      {}
      {e.ecg_parameters&&<div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Derived Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {Object.entries(e.ecg_parameters).map(([r,n])=><div key={r}className="bg-gray-900/50 p-3 rounded-lg">
                <p className="text-gray-400 capitalize">{r.replace(/_/g," ")}</p>
                <p className="text-xl font-semibold text-white">{String(n)}</p>
              </div>)}
          </div>
        </div>}
    </div>,V=()=><div className="mt-6 bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 text-sm no-print">
      <h3 className="text-lg font-semibold text-white mb-2">What these numbers mean:</h3>
      <ul className="space-y-2 text-gray-400">
        <li><strong>Heuristic Finding (like "Normal Sinus Rhythm"):</strong> A rough pattern match on the recorded beat — a demonstration, not a diagnosis.</li>
        <li><strong>Heart Rate (BPM):</strong> How many times your heart beats in a minute.</li>
        <li><strong>RR Interval (ms):</strong> The time between each heart beat, calculated from the heart rate.</li>
      </ul>
    </div>,Y=()=>{const e=C(),g=E(),[r,n]=v.useState("idle"),[l,y]=v.useState(null),{user:b}=G(),s=e.state?.reportData,_=t=>{const a=t.detailed_analysis.heart_rate.status,m=t.detailed_analysis.blood_pressure.status,x=t.detailed_analysis.blood_sugar.status,d=t.detailed_analysis.spo2.status,i=t.detailed_analysis.temperature.status,c=[a,m,x,d,i],p=c.filter(h=>h.toLowerCase()==="normal").length,u=c.length-p;let o="\u0906\u092A\u0915\u0947 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0915\u0947\u0924\u094B\u0902 \u0915\u093E \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u092A\u0942\u0930\u093E \u0939\u094B \u0917\u092F\u093E \u0939\u0948\u0964 ";return p===c.length?o+="\u0938\u092D\u0940 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0915\u0947\u0924 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u0940\u092E\u093E \u092E\u0947\u0902 \u0939\u0948\u0902\u0964 ":p>u?o+="\u0905\u0927\u093F\u0915\u093E\u0902\u0936 \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0915\u0947\u0924 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0902, \u0915\u0941\u091B \u092E\u0947\u0902 \u092E\u093E\u092E\u0942\u0932\u0940 \u0935\u093F\u091A\u0932\u0928 \u0939\u0948\u0964 ":o+="\u0915\u0941\u091B \u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0915\u0947\u0924\u094B\u0902 \u092E\u0947\u0902 \u0905\u0938\u093E\u092E\u093E\u0928\u094D\u092F\u0924\u093E \u0926\u0947\u0916\u0940 \u0917\u0908 \u0939\u0948\u0964 ",a!=="normal"&&(o+=`\u0939\u0943\u0926\u092F \u0917\u0924\u093F ${a} \u0938\u094D\u0924\u0930 \u092A\u0930 \u0939\u0948\u0964 `),m!=="normal"&&(o+=`\u0930\u0915\u094D\u0924\u091A\u093E\u092A ${m} \u0939\u0948\u0964 `),o+="\u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0928\u0940\u091A\u0947 \u0926\u0940 \u0917\u0908 \u0939\u0948\u0964",o};if(v.useEffect(()=>{if(s?.report&&w.isTTSAvailable()){const t=_(s.report),a=setTimeout(async()=>{try{await w.speakHindi(t,{speed:.7,pitch:1,volume:1})}catch(m){console.warn("Voice announcement failed:",m)}},1e3);return()=>clearTimeout(a)}},[s]),!s)return<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Report Data</h1>
          <button onClick={()=>g("/")}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg">
            Go Back to Monitoring
          </button>
        </div>
      </div>;const S=async()=>{n("sending");try{const t=await fetch(`${B}/send-report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s.email,report:s.report,ecgImages:s.ecgImages})});if(!t.ok)throw new Error(`Server responded with ${t.status}`);const a=await t.json().catch(()=>({}));y({deliveredTo:a?.deliveredTo,intendedRecipient:a?.intendedRecipient,rerouted:!!a?.rerouted}),n("sent")}catch(t){console.error("Failed to send email:",t),y(null),n("error")}},N=()=>{window.print()},R=()=>{const t=document.getElementById("printable-report");if(!t)return;const a=t.querySelector(".printable-content"),m={maxHeight:a.style.maxHeight,overflowY:a.style.overflowY};a&&(a.style.maxHeight="none",a.style.overflowY="visible"),I(t,{backgroundColor:"#1f2937",scale:2,useCORS:!0,onclone:x=>{const d=x.querySelector(".printable-content");d&&(d.style.maxHeight="none",d.style.overflowY="visible")}}).then(x=>{a&&(a.style.maxHeight=m.maxHeight,a.style.overflowY=m.overflowY);const d=x.toDataURL("image/png"),i=new H({orientation:"portrait",unit:"mm",format:"a4"}),c=i.internal.pageSize.getWidth(),p=i.getImageProperties(d),u=p.height*c/p.width;let o=u,h=0;const f=10;for(i.addImage(d,"PNG",f,h,c-f*2,u),o-=i.internal.pageSize.getHeight();o>=0;)h=o-u,i.addPage(),i.addImage(d,"PNG",f,h,c-f*2,u),o-=i.internal.pageSize.getHeight();i.save("ai-vital-signs-report.pdf")})};v.useEffect(()=>{const t=a=>{a.ctrlKey&&a.key==="p"&&(a.preventDefault(),N())};return window.addEventListener("keydown",t),()=>{window.removeEventListener("keydown",t)}},[]);const k=()=>{switch(r){case"sending":return<><D/> Sending...</>;case"sent":return<><$/> {l?.deliveredTo?`Sent to ${l.deliveredTo}`:"Sent Successfully!"}</>;case"error":return"Retry Sending Report";default:return<><T/> Send Report via Email</>}},A=`
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
  `;return<div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <style>{A}</style>
      <div className="container mx-auto max-w-4xl">
        {}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4 no-print">
          <div className="flex items-center gap-4">
            <button onClick={()=>g("/")}className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <L/>
              Back to Monitoring
            </button>
            <h1 className="text-3xl font-bold text-white">AI Analysis Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <P/>
          </div>
        </div>

        {}
        <div id="printable-report"className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Vital Signs Analysis</h2>
            {}
            {b&&<div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Patient Information</h3>
                <p className="text-gray-300"><strong>Name:</strong> {b.displayName||"N/A"}</p>
                <p className="text-gray-300"><strong>Age:</strong> {b.age||"N/A"} years</p>
                <p className="text-gray-300"><strong>Height:</strong> {b.height||"N/A"} cm</p>
                <p className="text-gray-300"><strong>Weight:</strong> {b.weight||"N/A"} kg</p>
              </div>}
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-4 text-gray-300 space-y-4 printable-content">
            <M analysis={s.report}className="section-break-after"/>
            {s.report.hubert_ecg_analysis&&<O analysis={s.report.hubert_ecg_analysis}className="section-break-after"/>}

            {}
            {s.ecgImages&&s.ecgImages.some(t=>t)&&<div className="mt-6">
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">ECG Waveforms</h2>
                <div className="space-y-4">
                  {s.ecgImages.map((t,a)=>t&&<div key={a}className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                      <img src={t}alt={`ECG Chart ${a+1}`}className="w-full h-auto rounded"/>
                    </div>)}
                </div>
              </div>}

            <V/>
          </div>

                    <div className="mt-6 pt-6 border-t border-gray-700/50 flex flex-wrap gap-4 no-print">
                      <button onClick={S}disabled={r==="sending"||r==="sent"}className={`w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200
                          ${r==="idle"&&"bg-cyan-600 hover:bg-cyan-700 text-white"}
                          ${r==="sending"&&"bg-gray-600 text-gray-300 cursor-not-allowed"}
                          ${r==="sent"&&"bg-green-600 text-white cursor-not-allowed"}
                          ${r==="error"&&"bg-red-600 hover:bg-red-700 text-white"}
                        `}>
                       {k()}
                      </button>
                      <button onClick={N}className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 bg-gray-600 hover:bg-gray-700 text-white">
                        Print Report
                      </button>
                      <button onClick={R}className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white">
                        <F/> Create PDF
                      </button>
                      {r==="error"&&<p className="text-red-400 text-sm mt-2 text-center w-full">Failed to send email. Please check backend status and try again.</p>}
                      {r==="sent"&&l?.rerouted&&<p className="text-amber-300 text-sm mt-2 text-center w-full">
                          Note: the server is configured to reroute all reports to {l.deliveredTo}, so
                          {" "}{l.intendedRecipient} did not receive a copy. Set REROUTE_ALL_EMAILS=false on the
                          backend once your Resend sending domain is verified.
                        </p>}
                    </div>        </div>
      </div>
    </div>};export default Y;
