var s=Object.defineProperty;var n=(e,t,r)=>t in e?s(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var a=(e,t,r)=>n(e,typeof t!="symbol"?t+"":t,r);import{Component as i}from"react";class l extends i{constructor(r){super(r);a(this,"state");a(this,"props");a(this,"setState",r=>{super.setState(r)});this.state={hasError:!1}}static getDerivedStateFromError(r){return{hasError:!0,error:r}}componentDidCatch(r,o){console.error("\u{1F6A8} Error Boundary caught an error:",r),console.error("Error Info:",o),this.setState({error:r,errorInfo:o})}render(){return this.state.hasError?this.props.fallback?this.props.fallback:<div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-red-400 mb-4">🚨 Something went wrong</h1>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Error Details</h2>
              <p className="text-gray-300 mb-2">
                <strong>Error:</strong> {this.state.error?.message||"Unknown error"}
              </p>
              {this.state.error?.stack&&<details className="mt-4">
                  <summary className="text-gray-400 cursor-pointer">Stack Trace</summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-gray-900 p-4 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>}
            </div>
            
            <div className="flex gap-4">
              <button onClick={()=>window.location.reload()}className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
                Reload Page
              </button>
              <button onClick={()=>this.setState({hasError:!1})}className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>:this.props.children}}export default l;
