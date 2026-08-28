import{LineChart as E,Line as R,XAxis as L,YAxis as P,ResponsiveContainer as W,ReferenceLine as C}from"recharts";const K=({data:N,strokeColor:w="#10B981",leadType:A="Standard"})=><div className="bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg border border-gray-600/30 shadow-inner h-full w-full relative">
      {}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
          {Array.from({length:72}).map((z,D)=><div key={D}className="border border-gray-600/30"/>)}
        </div>
      </div>
      
      {}
      <div className="relative z-10 h-full">
        <W width="100%"height="100%">
          <E data={N}margin={{top:5,right:5,left:5,bottom:5}}>
            <L hide dataKey="name"/>
            <P hide domain={[0,100]}/>
            
            {}
            <C y={50}stroke="#374151"strokeDasharray="2 2"strokeWidth={1}/>
            <C y={25}stroke="#374151"strokeDasharray="1 1"strokeWidth={.5}/>
            <C y={75}stroke="#374151"strokeDasharray="1 1"strokeWidth={.5}/>
            
            <R type="monotone"dataKey="uv"stroke={w}strokeWidth={2.5}dot={!1}isAnimationActive={!1}connectNulls={!1}/>
          </E>
        </W>
      </div>
      
      {}
      <div className="absolute bottom-1 left-1 text-xs text-gray-500">
        1mV
      </div>
      
      {}
      <div className="absolute top-1 left-2 text-xs text-gray-400">
        {A}
      </div>
    </div>;export default K;
