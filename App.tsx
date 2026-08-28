import D from"react";import{BrowserRouter as S,Routes as _,Route as R}from"react-router-dom";import{AuthProvider as C}from"./contexts/AuthContext";import{DeviceProvider as F}from"./contexts/DeviceContext";import P from"./components/ProtectedRoute";import L from"./components/AuthPage";import M from"./components/SignUpPage";import E from"./components/ErrorBoundary";import T from"./MonitoringPage";import U from"./components/ReportPage";import G from"./components/DashboardPage";import H from"./components/SharedLayout";import I from"./components/AuthRedirector";const J=()=>(D.useEffect(()=>{const A=console.error;return console.error=(...B)=>{B[0]?.includes?.("listener indicated an asynchronous response")||A.apply(console,B)},()=>{console.error=A}},[]),<C>
      <F>
      <S future={{v7_startTransition:!0,v7_relativeSplatPath:!0}}>
        <I/>
        <_>
          {}
          <R path="/"element={<E>
              <L/>
            </E>}/>

          {}
          <R path="/signup"element={<E>
              <M/>
            </E>}/>

          {}
          <R element={<H/>}>
            <R path="/monitoring"element={<P><T/></P>}/>
            <R path="/dashboard"element={<P><G/></P>}/>
            <R path="/report"element={<P><E><U/></E></P>}/>
          </R>
        </_>
      </S>
      </F>
    </C>);export default J;
