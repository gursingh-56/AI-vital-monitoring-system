import B from"react";import{BrowserRouter as S,Routes as _,Route as R}from"react-router-dom";import{AuthProvider as C}from"./contexts/AuthContext";import P from"./components/ProtectedRoute";import D from"./components/AuthPage";import F from"./components/SignUpPage";import E from"./components/ErrorBoundary";import L from"./MonitoringPage";import M from"./components/ReportPage";import T from"./components/DashboardPage";import U from"./components/SharedLayout";import G from"./components/AuthRedirector";const H=()=>(B.useEffect(()=>{const v=console.error;return console.error=(...A)=>{A[0]?.includes?.("listener indicated an asynchronous response")||v.apply(console,A)},()=>{console.error=v}},[]),<C>
      <S future={{v7_startTransition:!0,v7_relativeSplatPath:!0}}>
        <G/>
        <_>
          {}
          <R path="/"element={<E>
              <D/>
            </E>}/>

          {}
          <R path="/signup"element={<E>
              <F/>
            </E>}/>

          {}
          <R element={<U/>}>
            <R path="/monitoring"element={<P><L/></P>}/>
            <R path="/dashboard"element={<P><T/></P>}/>
            <R path="/report"element={<P><E><M/></E></P>}/>
          </R>
        </_>
      </S>
    </C>);export default H;
