import{useState as c,useEffect as x}from"react";import{useAuth as N}from"../contexts/AuthContext";import{ArrowLeftIcon as A,CheckIcon as C,SpinnerIcon as S}from"./icons";import{useNavigate as P}from"react-router-dom";import{BACKEND_URL as k}from"../services/apiConfig";const U=()=>{const{user:a,getIdToken:m,updateUser:b}=N(),p=P(),[e,i]=c({}),[u,o]=c("idle"),[d,g]=c(!1);x(()=>{(async()=>{if(a){const t={height:a.height||"",weight:a.weight||"",age:a.age||"",gender:a.gender||"male",bodyAge:a.bodyAge};i(t),t.height&&t.weight&&t.age&&g(!0)}})()},[a]);const s=r=>{const{name:t,value:n}=r.target;i(l=>({...l,[t]:n})),g(!1),o("idle")},y=async r=>{r.preventDefault(),o("updating");try{const t=await m(),n=await fetch(`${k}/auth/update-profile`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({height:Number(e.height),weight:Number(e.weight),age:Number(e.age),gender:e.gender})});if(!n.ok)throw new Error("Failed to update profile");const l=await n.json();i(v=>({...v,bodyAge:l.profile.bodyAge})),b(l.profile),g(!0),o("success")}catch(t){console.error(t),o("error")}},f=()=>{switch(u){case"updating":return<><S/> Saving...</>;case"success":return<><C/> Saved!</>;case"error":return"Save Failed - Retry";default:return"Save & Calculate Body Age"}},h=()=>{if(!d||!e.bodyAge)return null;const r=Math.round(Math.abs(e.bodyAge-(e.age||0))*10)/10;let t="You\u2019re right on track \u{1F44D}";return e.bodyAge>(e.age||0)?t=`Your body is acting ${r} years older \u{1FAE3}`:e.bodyAge<(e.age||0)&&(t=`You\u2019re ${r} years younger than your age \u{1F525}`),<div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 mt-8 text-center shadow-lg animate-fade-in">
        <p className="text-blue-300 font-semibold">Your Real Body Age</p>
        <p className="text-6xl font-bold text-white my-2">{e.bodyAge}</p>
        <p className="text-gray-300 font-medium">{t}</p>
      </div>};return<div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <button onClick={()=>p("/")}className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            <A/>
            Back to Monitoring
          </button>
        </header>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          {!d&&<div className="text-center mb-6 p-4 bg-cyan-900/30 rounded-lg">
              <h2 className="text-2xl font-semibold text-cyan-300">Welcome!</h2>
              <p className="text-gray-300">Complete your profile to calculate your Body Age.</p>
            </div>}
          <h2 className="text-2xl font-semibold text-cyan-300 mb-4">{d?"Update Your Profile":"Enter Your Details"}</h2>
          <form onSubmit={y}className="space-y-4">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age"className="block text-sm font-medium text-gray-300 mb-1">Age (years)</label>
                <input type="number"name="age"id="age"value={e.age||""}onChange={s}className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"required/>
              </div>
              <div>
                <label htmlFor="gender"className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                <select name="gender"id="gender"value={e.gender||"male"}onChange={s}className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="height"className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                <input type="number"name="height"id="height"value={e.height||""}onChange={s}className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"required/>
              </div>
              <div>
                <label htmlFor="weight"className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                <input type="number"name="weight"id="weight"value={e.weight||""}onChange={s}className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"required/>
              </div>
            </div>
            
            <div className="pt-2">
              <button type="submit"disabled={u==="updating"}className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-200 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600">
                {f()}
              </button>
            </div>
          </form>
        </div>

        {h()}

      </div>
    </div>};export default U;
