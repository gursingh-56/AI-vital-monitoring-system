import{useAuth as i}from"../contexts/AuthContext";import{useNavigate as n}from"react-router-dom";const o=({children:e})=>{const{isAuthenticated:t,loading:r}=i(),a=n();return r?<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-300 text-lg">Checking authentication...</p>
        </div>
      </div>:t?<>{e}</>:(a("/"),null)};export default o;
