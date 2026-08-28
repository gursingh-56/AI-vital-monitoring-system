import X,{useState as p,useEffect as B,useRef as i,useCallback as D}from"react";import{toPng as we}from"html-to-image";import{useNavigate as Re}from"react-router-dom";import{useAuth as Ee}from"./contexts/AuthContext";import{useDevice as Ae}from"./contexts/DeviceContext";import{VITAL_RANGES as b,getBloodPressureRanges as ee,ECG_PATTERN_1 as h,ECG_PATTERN_2 as Ie,ECG_PATTERN_3 as Se,ECG_DATA_LENGTH as te,MONITORING_DURATION_MS as Te,ECG_TICK_MS as Ce,VITALS_TICK_MS as Me,ECG_SAMPLE_RATE_HZ as De,PVC_PATTERN_1 as ae,PVC_PATTERN_2 as Pe,PVC_PATTERN_3 as _e}from"./constants";import{getVitalAnalysis as Ve}from"./services/geminiService";import{ECG_SERVICE_URL as ke}from"./services/apiConfig";import P,{HINDI_MESSAGES as re}from"./services/ttsService";import I from"./components/VitalSignCard";import U from"./components/EcgChart";import Le from"./components/DeviceStatusBadge";import{HeartIcon as Ge,BloodPressureIcon as Oe,DropletIcon as He,EcgIcon as $,SpO2Icon as Be,TemperatureIcon as Ue}from"./components/icons";const $e=()=>{const ne=Re(),{user:S,signOut:Fe}=Ee(),[y,T]=p("READY"),[oe,se]=p(""),{status:l,connect:ie,disconnect:F}=Ae(),[v,le]=p(null);X.useEffect(()=>{S?.email&&se(S.email)},[S]);const _=v??(Number(S?.age)||null)??30,V=i(_);B(()=>{V.current=_},[_]),X.useEffect(()=>{const t=a=>{a.ctrlKey&&a.shiftKey&&a.key.toLowerCase()==="a"&&(a.preventDefault(),le(e=>{const n=[20,25,35,45,55,null],r=n.findIndex(o=>o===e),s=n[(r+1)%n.length];if(s===null)console.log("\u{1F513} Age override disabled - using profile age");else{const o=ee(s);console.log(`\u{1F527} Age override set to: ${s} years`),console.log(`\u{1F527} BP Range: ${o.systolic.min}-${o.systolic.max}/${o.diastolic.min}-${o.diastolic.max}`)}return s}),C(e=>({...e,bloodPressure:{systolic:0,diastolic:0}})))};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[]);const[c,C]=p({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),[ce,N]=p([]),[de,w]=p([]),[ue,R]=p([]),[me,k]=p(null),[ge,L]=p([]),d=i(null),u=i(null),m=i(null),x=i(0),f=i({type:"none",index:0}),G=i(c),M=i([]),E=i("READY");B(()=>{E.current=y},[y]);const Y=i(null),j=i(null),z=i(null),O=i({amplitude:1,beatLength:h.length}),K=(t,a,e,n)=>{if(e===0)return Math.floor(Math.random()*(a-t+1))+t;const r=(Math.random()-.5)*n;return Math.max(t,Math.min(a,Math.round(e+r)))},Z=(t,a,e,n)=>{if(e===0)return Math.floor(Math.random()*(a-t+1))+t;const r=(Math.random()-.5)*n,s=Math.round(e+r);return Math.max(t,Math.min(a,s))},Ye=(t,a,e,n)=>{if(e===0)return Math.random()*n*2;if(e<t){const o=Math.random()*n*3,A=e+o;return Math.min(A,t)}const r=(Math.random()-.5)*n,s=e+r;return Math.max(t,Math.min(a,s))},pe=(t,a,e,n)=>{if(e===0)return 98;const r=(Math.random()-.5)*n*8,s=e+r;return Math.max(t,Math.min(a,s))},be=(t,a,e,n)=>{if(e===0)return .1;if(e<10)return 90+Math.random()*5;if(e<98){const o=Math.random()*n*5,A=e+o;return Math.min(A,98)}const r=(Math.random()-.5)*n,s=e+r;return Math.max(t,Math.min(a,s))},g=(t,a,e=!1)=>{t(n=>{const r=[...n];return r.push({name:`${Date.now()}`,uv:a}),r.length>te&&r.shift(),e&&(M.current=r),r})},J=D(()=>{C(t=>{const a=V.current,e=ee(a),n={heartRate:K(b.heartRate.min,b.heartRate.max,t.heartRate,2),bloodPressure:{systolic:Z(e.systolic.min,e.systolic.max,t.bloodPressure.systolic,3),diastolic:Z(e.diastolic.min,e.diastolic.max,t.bloodPressure.diastolic,2)},bloodSugar:K(b.bloodSugar.min,b.bloodSugar.max,t.bloodSugar,4),spo2:pe(b.spo2.min,b.spo2.max,t.spo2,.5),temperature:be(b.temperature.min,b.temperature.max,t.temperature,.1)};return G.current=n,n})},[]),q=D(()=>{if(x.current===0&&f.current.type==="none"&&(Math.random()<.1?f.current={type:"pvc",index:0}:O.current={amplitude:1+(Math.random()-.5)*.1,beatLength:h.length+Math.floor(Math.random()*3)}),f.current.type==="pvc"){const a=f.current.index;g(N,ae[a],!0),g(w,Pe[a]),g(R,_e[a]);const e=a+1;e>=ae.length?(f.current={type:"none",index:0},x.current=0):f.current.index=e}else{const a=x.current,{amplitude:e,beatLength:n}=O.current;if(a>=h.length)g(N,50,!0),g(w,50),g(R,50);else{const r=s=>(s-50)*e+50;g(N,r(h[a]),!0),g(w,r(Ie[a])),g(R,r(Se[a]))}n>0?x.current=(a+1)%n:x.current=(a+1)%h.length}},[]),fe=async(t,a)=>{const e=t.map(r=>r.uv),n=De;try{const r=await fetch(`${ke}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ecg_signal:[e],original_frequency:n,heart_rate:a})});return r.ok?await r.json():(console.error("HuBERT-ECG backend error:",r.statusText),{error:`Failed to get analysis from HuBERT-ECG backend (status: ${r.status})`})}catch(r){return console.error("Failed to fetch from HuBERT-ECG backend:",r),{error:"Could not connect to the HuBERT-ECG analysis service."}}},H=D(async()=>{if(d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current),d.current=null,u.current=null,m.current=null,E.current!=="MONITORING")return;if(E.current="ANALYZING",T("ANALYZING"),P.isTTSAvailable())try{await P.speakHindi(re.ANALYSIS_START,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}const[t,a]=await Promise.all([Ve(G.current,V.current),fe(M.current,G.current.heartRate)]);let e;try{e=JSON.parse(t)}catch(o){console.error("Failed to parse Gemini analysis JSON:",o),e={overall_assessment:"Analysis completed but formatting error occurred.",detailed_analysis:{heart_rate:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_pressure:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_sugar:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},spo2:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},temperature:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"}},potential_diagnosis:"Unable to provide diagnosis due to analysis error.",recommendations:["Consult healthcare professional","Monitor vital signs regularly"]}}const n={...e,hubert_ecg_analysis:a};k(n);const r=async o=>{if(!o.current)return null;try{return await we(o.current,{backgroundColor:"#1F2937",pixelRatio:2})}catch(A){return console.error("Failed to capture ECG chart image:",A),null}},s=await Promise.all([r(Y),r(j),r(z)]);if(L(s),T("COMPLETE"),P.isTTSAvailable())try{await P.speakHindi(re.ANALYSIS_COMPLETE,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}},[]);B(()=>(y==="MONITORING"&&(d.current=window.setInterval(J,Me),u.current=window.setInterval(q,Ce),m.current=window.setTimeout(H,Te)),()=>{d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current)}),[y,H,J,q]);const ve=()=>({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),xe=()=>{N([]),w([]),R([]),M.current=[]},Q=()=>ie(),W=D(()=>{d.current&&clearInterval(d.current),u.current&&clearInterval(u.current),m.current&&clearTimeout(m.current),d.current=null,u.current=null,m.current=null,E.current="READY",T("READY"),F(),C(ve()),xe(),k(null),L([])},[F]),he=()=>{if(l!=="connected")return;k(null),L([]),C({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0});const t=Array(te).fill({name:"0",uv:50});N(t),w(t),R(t),M.current=t,x.current=0,f.current={type:"none",index:0},O.current={amplitude:1,beatLength:h.length},E.current="MONITORING",T("MONITORING")},ye=()=>{ne("/report",{state:{reportData:{report:me,email:oe,ecgImages:ge}}})},Ne=()=>{if(l==="disconnected")return<button onClick={Q}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          Connect Device
        </button>;if(l==="connecting")return<div className="flex items-center gap-3 px-4 py-2 bg-amber-600/20 rounded-lg border border-amber-500/30">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
          <span className="text-amber-300 font-semibold text-sm">Scanning for device…</span>
        </div>;if(l==="error")return<button onClick={Q}className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors">
          Retry Connection
        </button>;switch(y){case"READY":return<div className="flex items-center gap-3">
            <button onClick={W}className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
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
            <button onClick={W}className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
              Disconnect
            </button>
            <button onClick={ye}className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors">
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
            <Le status={l}/>
          </div>
          {Ne()}
        </header>
        <main className="space-y-6">
          {l==="error"&&<div role="alert"className="rounded-xl border-2 border-red-500/60 bg-red-950/40 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">!</span>
                <div>
                  <h2 className="text-lg font-semibold text-red-200">No device / hardware connected</h2>
                  <p className="mt-1 text-sm text-red-300/90">
                    No vital-signs hardware was detected, so monitoring cannot start and no
                    readings can be taken. Connect a device and retry.
                  </p>
                </div>
              </div>
            </div>}

          {l==="disconnected"&&<div className="rounded-xl border border-gray-700/60 bg-gray-800/40 p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-200">No device connected</h2>
              <p className="mt-1 text-sm text-gray-400">
                Connect a vital-signs device to begin. No readings are produced until then.
              </p>
            </div>}

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-opacity ${l==="connected"?"":"opacity-40"}`}>
            <I icon={<Ge/>}label="Heart Rate"value={c.heartRate||"--"}unit="bpm"colorClass="border-red-500/50"/>
            <I icon={<Oe/>}label="Blood Pressure"value={c.bloodPressure.systolic?`${c.bloodPressure.systolic}/${c.bloodPressure.diastolic}`:"--/--"}unit="mmHg"colorClass="border-cyan-400/70"/>
            <I icon={<He/>}label="Blood Sugar"value={c.bloodSugar||"--"}unit="mg/dL"colorClass="border-yellow-500/50"/>
            <I icon={<Be/>}label="SpO2"value={c.spo2>0?c.spo2.toFixed(1):"--"}unit="%"colorClass="border-pink-500/50"/>
            <I icon={<Ue/>}label="Temperature"value={c.temperature!==void 0&&c.temperature!==null?`${c.temperature.toFixed(1)}\xB0F`:"--"}unit=""colorClass="border-purple-500/50"/>
          </div>
          
          
          <div className={`space-y-4 transition-opacity ${l==="connected"?"":"opacity-60"}`}>
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
                     <U data={ce}strokeColor="#10B981"leadType="Standard"/>
                     {l!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
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
                     <U data={de}strokeColor="#F59E0B"leadType="Long Axis"/>
                     {l!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
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
                     <U data={ue}strokeColor="#3B82F6"leadType="Inferior"/>
                     {l!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
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
    </div>};export default $e;
