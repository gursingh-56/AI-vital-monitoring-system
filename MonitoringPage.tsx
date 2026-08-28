import W,{useState as p,useEffect as B,useRef as i,useCallback as D}from"react";import{toPng as Ee}from"html-to-image";import{useNavigate as Re}from"react-router-dom";import{useAuth as we}from"./contexts/AuthContext";import{useDevice as Ae}from"./contexts/DeviceContext";import{VITAL_RANGES as b,getBloodPressureRanges as X,ECG_PATTERN_1 as h,ECG_PATTERN_2 as Ie,ECG_PATTERN_3 as Se,ECG_DATA_LENGTH as ee,MONITORING_DURATION_MS as Te,ECG_TICK_MS as Me,VITALS_TICK_MS as Ce,ECG_SAMPLE_RATE_HZ as De,PVC_PATTERN_1 as te,PVC_PATTERN_2 as Pe,PVC_PATTERN_3 as _e}from"./constants";import{getVitalAnalysis as Ve}from"./services/geminiService";import{ECG_SERVICE_URL as Le}from"./services/apiConfig";import P,{HINDI_MESSAGES as ae}from"./services/ttsService";import I from"./components/VitalSignCard";import U from"./components/EcgChart";import Ge from"./components/DeviceStatusBadge";import{HeartIcon as Oe,BloodPressureIcon as He,DropletIcon as Be,EcgIcon as $,SpO2Icon as Ue,TemperatureIcon as $e}from"./components/icons";const Fe=()=>{const ne=Re(),{user:S,signOut:Ye}=we(),[x,T]=p("READY"),[re,oe]=p(""),{status:c,connect:se,disconnect:F}=Ae(),[v,ie]=p(null);W.useEffect(()=>{S?.email&&oe(S.email)},[S]);const _=v??(Number(S?.age)||null)??30,V=i(_);B(()=>{V.current=_},[_]),W.useEffect(()=>{const t=a=>{a.ctrlKey&&a.shiftKey&&a.key.toLowerCase()==="a"&&(a.preventDefault(),ie(e=>{const r=[20,25,35,45,55,null],n=r.findIndex(o=>o===e),s=r[(n+1)%r.length];if(s===null)console.log("\u{1F513} Age override disabled - using profile age");else{const o=X(s);console.log(`\u{1F527} Age override set to: ${s} years`),console.log(`\u{1F527} BP Range: ${o.systolic.min}-${o.systolic.max}/${o.diastolic.min}-${o.diastolic.max}`)}return s}),M(e=>({...e,bloodPressure:{systolic:0,diastolic:0}})))};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[]);const[l,M]=p({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),[le,N]=p([]),[ce,E]=p([]),[de,R]=p([]),[ue,L]=p(null),[me,G]=p([]),d=i(null),u=i(null),m=i(null),y=i(0),f=i({type:"none",index:0}),k=i(l),C=i([]),w=i("READY");B(()=>{w.current=x},[x]);const Y=i(null),j=i(null),z=i(null),O=i({amplitude:1,beatLength:h.length}),K=(t,a,e,r)=>{if(e===0)return Math.floor(Math.random()*(a-t+1))+t;const n=(Math.random()-.5)*r;return Math.max(t,Math.min(a,Math.round(e+n)))},Z=(t,a,e,r)=>{if(e===0)return Math.floor(Math.random()*(a-t+1))+t;const n=(Math.random()-.5)*r,s=Math.round(e+n);return Math.max(t,Math.min(a,s))},je=(t,a,e,r)=>{if(e===0)return Math.random()*r*2;if(e<t){const o=Math.random()*r*3,A=e+o;return Math.min(A,t)}const n=(Math.random()-.5)*r,s=e+n;return Math.max(t,Math.min(a,s))},ge=(t,a,e,r)=>{if(e===0)return 98;const n=(Math.random()-.5)*r*8,s=e+n;return Math.max(t,Math.min(a,s))},pe=(t,a,e,r)=>{if(e===0)return .1;if(e<10)return 90+Math.random()*5;if(e<98){const o=Math.random()*r*5,A=e+o;return Math.min(A,98)}const n=(Math.random()-.5)*r,s=e+n;return Math.max(t,Math.min(a,s))},g=(t,a,e=!1)=>{t(r=>{const n=[...r];return n.push({name:`${Date.now()}`,uv:a}),n.length>ee&&n.shift(),e&&(C.current=n),n})},J=D(()=>{M(t=>{const a=V.current,e=X(a),r={heartRate:K(b.heartRate.min,b.heartRate.max,t.heartRate,2),bloodPressure:{systolic:Z(e.systolic.min,e.systolic.max,t.bloodPressure.systolic,3),diastolic:Z(e.diastolic.min,e.diastolic.max,t.bloodPressure.diastolic,2)},bloodSugar:K(b.bloodSugar.min,b.bloodSugar.max,t.bloodSugar,4),spo2:ge(b.spo2.min,b.spo2.max,t.spo2,.5),temperature:pe(b.temperature.min,b.temperature.max,t.temperature,.1)};return k.current=r,r})},[]),q=D(()=>{if(y.current===0&&f.current.type==="none"&&(Math.random()<.1?f.current={type:"pvc",index:0}:O.current={amplitude:1+(Math.random()-.5)*.1,beatLength:h.length+Math.floor(Math.random()*3)}),f.current.type==="pvc"){const a=f.current.index;g(N,te[a],!0),g(E,Pe[a]),g(R,_e[a]);const e=a+1;e>=te.length?(f.current={type:"none",index:0},y.current=0):f.current.index=e}else{const a=y.current,{amplitude:e,beatLength:r}=O.current;if(a>=h.length)g(N,50,!0),g(E,50),g(R,50);else{const n=s=>(s-50)*e+50;g(N,n(h[a]),!0),g(E,n(Ie[a])),g(R,n(Se[a]))}r>0?y.current=(a+1)%r:y.current=(a+1)%h.length}},[]),be=async(t,a)=>{const e=t.map(n=>n.uv),r=De;try{const n=await fetch(`${Le}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ecg_signal:[e],original_frequency:r,heart_rate:a})});return n.ok?await n.json():(console.error("HuBERT-ECG backend error:",n.statusText),{error:`Failed to get analysis from HuBERT-ECG backend (status: ${n.status})`})}catch(n){return console.error("Failed to fetch from HuBERT-ECG backend:",n),{error:"Could not connect to the HuBERT-ECG analysis service."}}},H=D(async()=>{if(d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current),d.current=null,u.current=null,m.current=null,w.current!=="MONITORING")return;if(w.current="ANALYZING",T("ANALYZING"),P.isTTSAvailable())try{await P.speakHindi(ae.ANALYSIS_START,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}const[t,a]=await Promise.all([Ve(k.current,V.current),be(C.current,k.current.heartRate)]);let e;try{e=JSON.parse(t)}catch(o){console.error("Failed to parse Gemini analysis JSON:",o),e={overall_assessment:"Analysis completed but formatting error occurred.",detailed_analysis:{heart_rate:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_pressure:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_sugar:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},spo2:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},temperature:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"}},potential_diagnosis:"Unable to provide diagnosis due to analysis error.",recommendations:["Consult healthcare professional","Monitor vital signs regularly"]}}const r={...e,hubert_ecg_analysis:a};L(r);const n=async o=>{if(!o.current)return null;try{return await Ee(o.current,{backgroundColor:"#1F2937",pixelRatio:2})}catch(A){return console.error("Failed to capture ECG chart image:",A),null}},s=await Promise.all([n(Y),n(j),n(z)]);if(G(s),T("COMPLETE"),P.isTTSAvailable())try{await P.speakHindi(ae.ANALYSIS_COMPLETE,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}},[]);B(()=>(x==="MONITORING"&&(d.current=window.setInterval(J,Ce),u.current=window.setInterval(q,Me),m.current=window.setTimeout(H,Te)),()=>{d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current)}),[x,H,J,q]);const fe=()=>({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),ve=()=>{N([]),E([]),R([]),C.current=[]},ye=()=>se(),Q=D(()=>{d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current),d.current=null,u.current=null,m.current=null,w.current="READY",T("READY"),F(),M(fe()),ve(),L(null),G([])},[F]),he=()=>{if(c!=="connected")return;L(null),G([]),M({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0});const t=Array(ee).fill({name:"0",uv:50});N(t),E(t),R(t),C.current=t,y.current=0,f.current={type:"none",index:0},O.current={amplitude:1,beatLength:h.length},w.current="MONITORING",T("MONITORING")},xe=()=>{ne("/report",{state:{reportData:{report:ue,email:re,ecgImages:me}}})},Ne=()=>{if(c==="disconnected")return<button onClick={ye}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          Connect Device
        </button>;if(c==="connecting")return<div className="flex items-center gap-3 px-4 py-2 bg-amber-600/20 rounded-lg border border-amber-500/30">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
          <span className="text-amber-300 font-semibold text-sm">Connecting…</span>
        </div>;switch(x){case"READY":return<div className="flex items-center gap-3">
            <button onClick={Q}className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
              Disconnect
            </button>
            <button onClick={he}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors">
              Start Monitoring
            </button>
          </div>;case"MONITORING":return<button onClick={H}className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors">
            Stop & Analyze
          </button>;case"ANALYZING":return<div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
            <div className="relative">
              <div className="w-6 h-6 border-2 border-cyan-400 rounded-full animate-spin"/>
              <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-cyan-200 rounded-full animate-spin"style={{animationDirection:"reverse",animationDuration:"0.8s"}}/>
            </div>
            <div className="flex flex-col">
              <span className="text-cyan-300 font-semibold text-sm">AI Analysis in Progress</span>
              <span className="text-cyan-400 text-xs">Processing vital signs and ECG data...</span>
            </div>
          </div>;case"COMPLETE":return<div className="flex items-center gap-3">
            <button onClick={Q}className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
              Disconnect
            </button>
            <button onClick={xe}className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors">
              View AI Report
            </button>
          </div>;default:return null}};return<div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-900 font-sans relative">
      {}
      {v&&<div className="fixed top-4 right-4 z-50">
          <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${v>=10&&v<=29?"bg-green-500":"bg-blue-500"}`}title={v>=10&&v<=29?"Range 1: Age 10-29 (139-155/78-93)":"Range 2: Age 30+ (120-142/72-88)"}/>
        </div>}
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-bold text-white">Real-Time Vital Signs</h1>
            <Ge status={c}/>
          </div>
          {Ne()}
        </header>
        <main className="space-y-6">
          {c==="disconnected"&&<div className="rounded-xl border border-gray-700/60 bg-gray-800/40 p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-200">No device connected</h2>
              <p className="mt-1 text-sm text-gray-400">
                Connect a vital-signs device to begin. No readings are produced until then.
              </p>
            </div>}

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-opacity ${c==="connected"?"":"opacity-40"}`}>
            <I icon={<Oe/>}label="Heart Rate"value={l.heartRate||"--"}unit="bpm"colorClass="border-red-500/50"/>
            <I icon={<He/>}label="Blood Pressure"value={l.bloodPressure.systolic?`${l.bloodPressure.systolic}/${l.bloodPressure.diastolic}`:"--/--"}unit="mmHg"colorClass="border-cyan-400/70"/>
            <I icon={<Be/>}label="Blood Sugar"value={l.bloodSugar||"--"}unit="mg/dL"colorClass="border-yellow-500/50"/>
            <I icon={<Ue/>}label="SpO2"value={l.spo2>0?l.spo2.toFixed(1):"--"}unit="%"colorClass="border-pink-500/50"/>
            <I icon={<$e/>}label="Temperature"value={l.temperature!==void 0&&l.temperature!==null?`${l.temperature.toFixed(1)}\xB0F`:"--"}unit=""colorClass="border-purple-500/50"/>
          </div>
          
          
          <div className={`space-y-4 transition-opacity ${c==="connected"?"":"opacity-60"}`}>
              {}
              <div ref={Y}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-green-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <$/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead I</h3>
                          <span className="ml-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Standard</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <U data={le}strokeColor="#10B981"leadType="Standard"/>
                     {c!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
                         <span className="text-xs uppercase tracking-widest text-gray-500">No signal</span>
                       </div>}
                     <div className="absolute top-2 right-2 text-xs text-green-400 bg-gray-900/80 px-2 py-1 rounded">
                         P-QRS-T Complex
                     </div>
                  </div>
              </div>

              {}
              <div ref={j}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-amber-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <$/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead II</h3>
                          <span className="ml-3 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Long Axis</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <U data={ce}strokeColor="#F59E0B"leadType="Long Axis"/>
                     {c!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
                         <span className="text-xs uppercase tracking-widest text-gray-500">No signal</span>
                       </div>}
                     <div className="absolute top-2 right-2 text-xs text-amber-400 bg-gray-900/80 px-2 py-1 rounded">
                         Enhanced R-wave
                     </div>
                  </div>
              </div>

              {}
              <div ref={z}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <$/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead III</h3>
                          <span className="ml-3 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Inferior</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <U data={de}strokeColor="#3B82F6"leadType="Inferior"/>
                     {c!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
                         <span className="text-xs uppercase tracking-widest text-gray-500">No signal</span>
                       </div>}
                     <div className="absolute top-2 right-2 text-xs text-blue-400 bg-gray-900/80 px-2 py-1 rounded">
                         Inverted T-wave
                     </div>
                  </div>
              </div>
          </div>
        </main>
      </div>
    </div>};export default Fe;
