import{useState as a}from"react";import{useAuth as w}from"../contexts/AuthContext";import{useNavigate as N,Link as C}from"react-router-dom";const k=()=>{const n=w(),F=N();if(!n)return<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-300 text-lg">Loading authentication...</p>
        </div>
      </div>;const{signUp:g,signIn:p,loading:l,isAuthenticated:P}=n,[i,y]=a(""),[s,b]=a(""),[d,f]=a(""),[c,v]=a(""),[m,t]=a(null),[r,o]=a(!1),x=async()=>{try{t(null),o(!0),await p()}catch(e){console.error("Google sign up error:",e),t(e.message||"Failed to sign up with Google")}finally{o(!1)}},h=async e=>{if(e.preventDefault(),s!==d){t("Passwords do not match");return}try{t(null),o(!0),await g(i,s,c)}catch(u){console.error("Email sign up error:",u),t(u.message||"Failed to create account")}finally{o(!1)}};return<div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-cyan-400"fill="none"stroke="currentColor"viewBox="0 0 24 24">
              <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join our medical monitoring platform</p>
        </div>

        {}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {}
          <button onClick={x}disabled={l||r}className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed">
            {r?<div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>:<svg className="w-5 h-5"viewBox="0 0 24 24">
                <path fill="#4285F4"d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853"d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05"d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335"d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>}
            Continue with Google
          </button>

          {}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"/>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          {}
          <form onSubmit={h}className="space-y-4">
            {}
            <div>
              <label htmlFor="displayName"className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input id="displayName"type="text"value={c}onChange={e=>v(e.target.value)}className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"placeholder="Enter your full name"required/>
            </div>

            {}
            <div>
              <label htmlFor="email"className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input id="email"type="email"value={i}onChange={e=>y(e.target.value)}className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"placeholder="Enter your email"required/>
            </div>

            {}
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input id="password"type="password"value={s}onChange={e=>b(e.target.value)}className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"placeholder="Create a password"required minLength={6}/>
            </div>

            {}
            <div>
              <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input id="confirmPassword"type="password"value={d}onChange={e=>f(e.target.value)}className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"placeholder="Confirm your password"required minLength={6}/>
            </div>


            {}
            {m&&<div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                {m}
              </div>}

            {}
            <button type="submit"disabled={l||r}className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {r?<>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Creating Account...
                </>:"Create Account"}
            </button>
          </form>

          {}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <C to="/"className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Sign In
              </C>
            </p>
          </div>
        </div>

        {}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By creating an account, you agree to our{" "}
            <a href="#"className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#"className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>};export default k;
