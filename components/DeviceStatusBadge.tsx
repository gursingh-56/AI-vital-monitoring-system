const n=({status:t})=>{const e={disconnected:{dot:"bg-gray-500",text:"text-gray-400",ring:"border-gray-600/50 bg-gray-800/50",label:"No device connected"},connecting:{dot:"bg-amber-400 animate-pulse",text:"text-amber-300",ring:"border-amber-500/40 bg-amber-900/20",label:"Connecting to device\u2026"},connected:{dot:"bg-green-500",text:"text-green-300",ring:"border-green-500/40 bg-green-900/20",label:"Device connected"}}[t];return<div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${e.ring}`}>
      <span className={`w-2 h-2 rounded-full ${e.dot}`}/>
      <span className={`text-sm font-medium ${e.text}`}>{e.label}</span>
    </div>};export default n;
