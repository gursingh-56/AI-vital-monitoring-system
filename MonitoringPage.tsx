import X,{useState as u,useEffect as P,useRef as i,useCallback as _}from"react";import{toPng as Ee}from"html-to-image";import{useNavigate as Re}from"react-router-dom";import{useAuth as we}from"./contexts/AuthContext";import{VITAL_RANGES as b,getBloodPressureRanges as ee,ECG_PATTERN_1 as x,ECG_PATTERN_2 as Ae,ECG_PATTERN_3 as Te,ECG_DATA_LENGTH as te,MONITORING_DURATION_MS as Ie,DEVICE_CONNECT_DURATION_MS as Se,ECG_TICK_MS as Ce,VITALS_TICK_MS as Me,ECG_SAMPLE_RATE_HZ as De,PVC_PATTERN_1 as ne,PVC_PATTERN_2 as Pe,PVC_PATTERN_3 as _e}from"./constants";import{getVitalAnalysis as Ve}from"./services/geminiService";import{ECG_SERVICE_URL as Le}from"./services/apiConfig";import V,{HINDI_MESSAGES as ae}from"./services/ttsService";import I from"./components/VitalSignCard";import F from"./components/EcgChart";import Ge from"./components/DeviceStatusBadge";import{HeartIcon as Oe,BloodPressureIcon as He,DropletIcon as Be,EcgIcon as Y,SpO2Icon as Ue,TemperatureIcon as $e}from"./components/icons";const Fe=()=>{const re=Re(),{user:S,signOut:Ye}=we(),[N,C]=u("READY"),[oe,se]=u(""),[l,L]=u("disconnected"),f=i(null),[y,ie]=u(null);X.useEffect(()=>{S?.email&&se(S.email)},[S]);const G=y??(Number(S?.age)||null)??30,O=i(G);P(()=>{O.current=G},[G]),X.useEffect(()=>{const t=n=>{n.ctrlKey&&n.shiftKey&&n.key.toLowerCase()==="a"&&(n.preventDefault(),ie(e=>{const r=[20,25,35,45,55,null],a=r.findIndex(o=>o===e),s=r[(a+1)%r.length];if(s===null)console.log("\u{1F513} Age override disabled - using profile age");else{const o=ee(s);console.log(`\u{1F527} Age override set to: ${s} years`),console.log(`\u{1F527} BP Range: ${o.systolic.min}-${o.systolic.max}/${o.diastolic.min}-${o.diastolic.max}`)}return s}),M(e=>({...e,bloodPressure:{systolic:0,diastolic:0}})))};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[]);const[c,M]=u({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),[le,E]=u([]),[ce,R]=u([]),[ue,w]=u([]),[de,k]=u(null),[me,H]=u([]),d=i(null),m=i(null),g=i(null),h=i(0),v=i({type:"none",index:0}),B=i(c),D=i([]),A=i("READY");P(()=>{A.current=N},[N]);const j=i(null),z=i(null),K=i(null),U=i({amplitude:1,beatLength:x.length}),Z=(t,n,e,r)=>{if(e===0)return Math.floor(Math.random()*(n-t+1))+t;const a=(Math.random()-.5)*r;return Math.max(t,Math.min(n,Math.round(e+a)))},J=(t,n,e,r)=>{if(e===0)return Math.floor(Math.random()*(n-t+1))+t;const a=(Math.random()-.5)*r,s=Math.round(e+a);return Math.max(t,Math.min(n,s))},je=(t,n,e,r)=>{if(e===0)return Math.random()*r*2;if(e<t){const o=Math.random()*r*3,T=e+o;return Math.min(T,t)}const a=(Math.random()-.5)*r,s=e+a;return Math.max(t,Math.min(n,s))},ge=(t,n,e,r)=>{if(e===0)return 98;const a=(Math.random()-.5)*r*8,s=e+a;return Math.max(t,Math.min(n,s))},pe=(t,n,e,r)=>{if(e===0)return .1;if(e<10)return 90+Math.random()*5;if(e<98){const o=Math.random()*r*5,T=e+o;return Math.min(T,98)}const a=(Math.random()-.5)*r,s=e+a;return Math.max(t,Math.min(n,s))},p=(t,n,e=!1)=>{t(r=>{const a=[...r];return a.push({name:`${Date.now()}`,uv:n}),a.length>te&&a.shift(),e&&(D.current=a),a})},q=_(()=>{M(t=>{const n=O.current,e=ee(n),r={heartRate:Z(b.heartRate.min,b.heartRate.max,t.heartRate,2),bloodPressure:{systolic:J(e.systolic.min,e.systolic.max,t.bloodPressure.systolic,3),diastolic:J(e.diastolic.min,e.diastolic.max,t.bloodPressure.diastolic,2)},bloodSugar:Z(b.bloodSugar.min,b.bloodSugar.max,t.bloodSugar,4),spo2:ge(b.spo2.min,b.spo2.max,t.spo2,.5),temperature:pe(b.temperature.min,b.temperature.max,t.temperature,.1)};return B.current=r,r})},[]),Q=_(()=>{if(h.current===0&&v.current.type==="none"&&(Math.random()<.1?v.current={type:"pvc",index:0}:U.current={amplitude:1+(Math.random()-.5)*.1,beatLength:x.length+Math.floor(Math.random()*3)}),v.current.type==="pvc"){const n=v.current.index;p(E,ne[n],!0),p(R,Pe[n]),p(w,_e[n]);const e=n+1;e>=ne.length?(v.current={type:"none",index:0},h.current=0):v.current.index=e}else{const n=h.current,{amplitude:e,beatLength:r}=U.current;if(n>=x.length)p(E,50,!0),p(R,50),p(w,50);else{const a=s=>(s-50)*e+50;p(E,a(x[n]),!0),p(R,a(Ae[n])),p(w,a(Te[n]))}r>0?h.current=(n+1)%r:h.current=(n+1)%x.length}},[]),be=async(t,n)=>{const e=t.map(a=>a.uv),r=De;try{const a=await fetch(`${Le}/predict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ecg_signal:[e],original_frequency:r,heart_rate:n})});return a.ok?await a.json():(console.error("HuBERT-ECG backend error:",a.statusText),{error:`Failed to get analysis from HuBERT-ECG backend (status: ${a.status})`})}catch(a){return console.error("Failed to fetch from HuBERT-ECG backend:",a),{error:"Could not connect to the HuBERT-ECG analysis service."}}},$=_(async()=>{if(d.current&&clearInterval(d.current),m.current&&clearInterval(m.current),g.current&&clearTimeout(g.current),d.current=null,m.current=null,g.current=null,A.current!=="MONITORING")return;if(A.current="ANALYZING",C("ANALYZING"),V.isTTSAvailable())try{await V.speakHindi(ae.ANALYSIS_START,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}const[t,n]=await Promise.all([Ve(B.current,O.current),be(D.current,B.current.heartRate)]);let e;try{e=JSON.parse(t)}catch(o){console.error("Failed to parse Gemini analysis JSON:",o),e={overall_assessment:"Analysis completed but formatting error occurred.",detailed_analysis:{heart_rate:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_pressure:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},blood_sugar:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},spo2:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"},temperature:{value:"N/A",status:"Unknown",explanation:"Unable to analyze"}},potential_diagnosis:"Unable to provide diagnosis due to analysis error.",recommendations:["Consult healthcare professional","Monitor vital signs regularly"]}}const r={...e,hubert_ecg_analysis:n};k(r);const a=async o=>{if(!o.current)return null;try{return await Ee(o.current,{backgroundColor:"#1F2937",pixelRatio:2})}catch(T){return console.error("Failed to capture ECG chart image:",T),null}},s=await Promise.all([a(j),a(z),a(K)]);if(H(s),C("COMPLETE"),V.isTTSAvailable())try{await V.speakHindi(ae.ANALYSIS_COMPLETE,{speed:.8,pitch:1,volume:1})}catch(o){console.warn("Voice announcement failed:",o)}},[]);P(()=>(N==="MONITORING"&&(d.current=window.setInterval(q,Me),m.current=window.setInterval(Q,Ce),g.current=window.setTimeout($,Ie)),()=>{d.current&&clearInterval(d.current),m.current&&clearInterval(m.current),g.current&&clearTimeout(g.current)}),[N,$,q,Q]);const fe=()=>({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0}),ve=()=>{E([]),R([]),w([]),D.current=[]},ye=()=>{l==="disconnected"&&(L("connecting"),f.current=window.setTimeout(()=>{f.current=null,L("connected")},Se))},W=_(()=>{f.current&&(clearTimeout(f.current),f.current=null),d.current&&clearInterval(d.current),m.current&&clearInterval(m.current),g.current&&clearTimeout(g.current),d.current=null,m.current=null,g.current=null,A.current="READY",C("READY"),L("disconnected"),M(fe()),ve(),k(null),H([])},[]);P(()=>()=>{f.current&&clearTimeout(f.current)},[]);const he=()=>{if(l!=="connected")return;k(null),H([]),M({heartRate:0,bloodPressure:{systolic:0,diastolic:0},bloodSugar:0,spo2:0,temperature:0});const t=Array(te).fill({name:"0",uv:50});E(t),R(t),w(t),D.current=t,h.current=0,v.current={type:"none",index:0},U.current={amplitude:1,beatLength:x.length},A.current="MONITORING",C("MONITORING")},xe=()=>{re("/report",{state:{reportData:{report:de,email:oe,ecgImages:me}}})},Ne=()=>{if(l==="disconnected")return<button onClick={ye}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors">
          Connect Device
        </button>;if(l==="connecting")return<div className="flex items-center gap-3 px-4 py-2 bg-amber-600/20 rounded-lg border border-amber-500/30">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
          <span className="text-amber-300 font-semibold text-sm">Connecting…</span>
        </div>;switch(N){case"READY":return<div className="flex items-center gap-3">
            <button onClick={W}className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
              Disconnect
            </button>
            <button onClick={he}className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors">
              Start Monitoring
            </button>
          </div>;case"MONITORING":return<button onClick={$}className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors">
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
            <button onClick={xe}className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors">
              View AI Report
            </button>
          </div>;default:return null}};return<div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-900 font-sans relative">
      {}
      {y&&<div className="fixed top-4 right-4 z-50">
          <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${y>=10&&y<=29?"bg-green-500":"bg-blue-500"}`}title={y>=10&&y<=29?"Range 1: Age 10-29 (139-155/78-93)":"Range 2: Age 30+ (120-142/72-88)"}/>
        </div>}
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-bold text-white">Real-Time Vital Signs</h1>
            <Ge status={l}/>
          </div>
          {Ne()}
        </header>
        <main className="space-y-6">
          {l==="disconnected"&&<div className="rounded-xl border border-gray-700/60 bg-gray-800/40 p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-200">No device connected</h2>
              <p className="mt-1 text-sm text-gray-400">
                Connect a vital-signs device to begin. No readings are produced until then.
              </p>
            </div>}

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-opacity ${l==="connected"?"":"opacity-40"}`}>
            <I icon={<Oe/>}label="Heart Rate"value={c.heartRate||"--"}unit="bpm"colorClass="border-red-500/50"/>
            <I icon={<He/>}label="Blood Pressure"value={c.bloodPressure.systolic?`${c.bloodPressure.systolic}/${c.bloodPressure.diastolic}`:"--/--"}unit="mmHg"colorClass="border-cyan-400/70"/>
            <I icon={<Be/>}label="Blood Sugar"value={c.bloodSugar||"--"}unit="mg/dL"colorClass="border-yellow-500/50"/>
            <I icon={<Ue/>}label="SpO2"value={c.spo2>0?c.spo2.toFixed(1):"--"}unit="%"colorClass="border-pink-500/50"/>
            <I icon={<$e/>}label="Temperature"value={c.temperature!==void 0&&c.temperature!==null?`${c.temperature.toFixed(1)}\xB0F`:"--"}unit=""colorClass="border-purple-500/50"/>
          </div>
          
          
          <div className={`space-y-4 transition-opacity ${l==="connected"?"":"opacity-60"}`}>
              {}
              <div ref={j}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-green-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <Y/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead I</h3>
                          <span className="ml-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Standard</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <F data={le}strokeColor="#10B981"leadType="Standard"/>
                     {l!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
                         <span className="text-xs uppercase tracking-widest text-gray-500">No signal</span>
                       </div>}
                     <div className="absolute top-2 right-2 text-xs text-green-400 bg-gray-900/80 px-2 py-1 rounded">
                         P-QRS-T Complex
                     </div>
                  </div>
              </div>

              {}
              <div ref={z}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-amber-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <Y/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead II</h3>
                          <span className="ml-3 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Long Axis</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <F data={ce}strokeColor="#F59E0B"leadType="Long Axis"/>
                     {l!=="connected"&&<div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-gray-900/70">
                         <span className="text-xs uppercase tracking-widest text-gray-500">No signal</span>
                       </div>}
                     <div className="absolute top-2 right-2 text-xs text-amber-400 bg-gray-900/80 px-2 py-1 rounded">
                         Enhanced R-wave
                     </div>
                  </div>
              </div>

              {}
              <div ref={K}className="h-48 flex flex-col p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between text-gray-300 mb-2">
                      <div className="flex items-center">
                          <Y/>
                          <h3 className="font-semibold text-lg ml-2">ECG Lead III</h3>
                          <span className="ml-3 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Inferior</span>
                      </div>
                  </div>
                  <div className="flex-grow relative">
                     <F data={ue}strokeColor="#3B82F6"leadType="Inferior"/>
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
    </div>};export default Fe;
