const l=({icon:t,label:e,value:a,unit:r,colorClass:s})=><div className={`bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 shadow-lg flex flex-col justify-between ${s}`}>
      <div className="flex items-center text-gray-300">
        {t}
        <h3 className="font-semibold text-lg">{e}</h3>
      </div>
      <div className="text-right mt-4">
        <span className="text-4xl font-bold tracking-tight text-white">{a}</span>
        <span className="text-lg ml-2 text-gray-400">{r}</span>
      </div>
    </div>;export default l;
