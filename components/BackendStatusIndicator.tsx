import{useState as c,useEffect as r}from"react";import{BACKEND_URL as i}from"../services/apiConfig";const d=()=>{const[e,t]=c(null),n=i;return r(()=>{const a=async()=>{try{const s=await fetch(n);t(s.ok)}catch{t(!1)}};a();const l=setInterval(a,5e3);return()=>clearInterval(l)},[n]),e===null?<div className="flex items-center space-x-2 text-sm text-gray-400">
        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"/>
        <span>Checking Backend...</span>
      </div>:<div className="flex items-center space-x-2 text-sm">
      <div className={`w-3 h-3 rounded-full ${e?"bg-green-500":"bg-red-500"}`}/>
      <span className={e?"text-gray-300":"text-red-400 font-semibold"}>
        Backend: {e?"Online":"Offline"}
      </span>
    </div>};export default d;
