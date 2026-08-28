require("dotenv").config();const express=require("express"),cors=require("cors"),{Resend}=require("resend"),authRoutes=require("./auth-routes"),{optionalAuth}=require("./auth-middleware"),requiredEnvVars=["RESEND_API_KEY","FROM_EMAIL","TO_EMAIL"],firebaseEnvVars=["FIREBASE_PROJECT_ID","FIREBASE_PRIVATE_KEY","FIREBASE_CLIENT_EMAIL"];for(const e of requiredEnvVars)process.env[e]||(console.error(`
[ERROR] Missing required environment variable: ${e}`),console.error("Please ensure you have a .env file in the /backend directory with all required values from .env.example."),process.exit(1));let firebaseConfigured=!0;for(const e of firebaseEnvVars)process.env[e]||(console.warn(`
[WARNING] Missing Firebase environment variable: ${e}`),firebaseConfigured=!1);firebaseConfigured||(console.warn(`
[WARNING] Firebase authentication will not be available.`),console.warn("Please configure Firebase environment variables for authentication features."));const app=express(),resend=new Resend(process.env.RESEND_API_KEY);app.use(cors({origin:"*",methods:"GET,POST",allowedHeaders:"Content-Type, Authorization"})),app.use(express.json({limit:"5mb"})),firebaseConfigured?(app.use("/auth",authRoutes),console.log("\u2705 Authentication routes enabled")):console.log("\u26A0\uFE0F Authentication routes disabled (Firebase not configured)");const PORT=process.env.PORT||3001;app.get("/",(e,r)=>{r.send("AI Vitals Backend is running! Ready to send reports via Resend.")});const escapeHtml=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),analysisToHtml=(e,r)=>{const o=s=>{switch(String(s??"").toLowerCase()){case"normal":return"#10b981";case"high":return"#ef4444";case"low":return"#f59e0b";default:return"#6b7280"}};let n=`
    <div style="font-family: Arial, sans-serif; color: #475569; max-width: 600px; margin: auto; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; background: #ffffff;">
      <p style="font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
        This report was generated for: <strong>${escapeHtml(r)}</strong>
      </p>
      
      <!-- Overall Assessment -->
      <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; color: #1e40af; margin: 0 0 12px 0;">\u{1F4CA} Overall Assessment</h2>
        <p style="color: #374151; line-height: 1.6; margin: 0;">${escapeHtml(e.overall_assessment)}</p>
      </div>

      <!-- Detailed Analysis -->
      <h2 style="font-size: 22px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 16px 0;">\u{1F50D} Detailed Analysis</h2>
  `;return[{key:"heart_rate",name:"\u2764\uFE0F Heart Rate",data:e.detailed_analysis.heart_rate},{key:"blood_pressure",name:"\u{1FA78} Blood Pressure",data:e.detailed_analysis.blood_pressure},{key:"blood_sugar",name:"\u{1F36F} Blood Sugar",data:e.detailed_analysis.blood_sugar},{key:"spo2",name:"\u{1F4A8} SpO2 (Oxygen Saturation)",data:e.detailed_analysis.spo2},{key:"temperature",name:"\u{1F321}\uFE0F Temperature",data:e.detailed_analysis.temperature}].forEach(s=>{const t=o(s.data.status);n+=`
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-size: 18px; color: #1e293b; margin: 0;">${s.name}</h3>
          <span style="background: ${t}20; color: ${t}; border: 1px solid ${t}50; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${escapeHtml(s.data.status)}
          </span>
        </div>
        <p style="color: #3b82f6; font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">${escapeHtml(s.data.value)}</p>
        <p style="color: #6b7280; line-height: 1.5; margin: 0; font-size: 14px;">${escapeHtml(s.data.explanation)}</p>
      </div>
    `}),n+=`
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h2 style="font-size: 20px; color: #92400e; margin: 0 0 12px 0;">\u{1F52C} Potential Diagnosis</h2>
      <p style="color: #374151; line-height: 1.6; margin: 0;">${escapeHtml(e.potential_diagnosis)}</p>
    </div>
  `,n+=`
    <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h2 style="font-size: 20px; color: #065f46; margin: 0 0 12px 0;">\u{1F4A1} Recommendations</h2>
      <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
  `,e.recommendations.forEach(s=>{n+=`<li style="margin-bottom: 8px;">${escapeHtml(s)}</li>`}),n+=`
      </ul>
    </div>
  </div>
  `,n};app.post("/send-report",optionalAuth,async(e,r)=>{console.log("Received request on /send-report"),e.user?console.log(`\u{1F4E7} Email request from authenticated user: ${e.user.email} (${e.user.uid})`):console.log("\u{1F4E7} Email request from anonymous user");const{email:o,report:n,ecgImages:a}=e.body;if(!o||!n)return console.log("[ERROR] Request rejected: Missing email or report."),r.status(400).json({success:!1,message:"Email and report are required."});const s=process.env.REROUTE_ALL_EMAILS!=="false",t=s?process.env.TO_EMAIL:o;console.log(s&&t!==o?`Intended recipient: ${o}. Rerouting to verified address: ${t}`:`Sending report directly to: ${t}`);try{let i=analysisToHtml(n,o);const c=[];a&&a.length>0&&(i+="<br><h3>ECG Readings</h3>",a.forEach((u,l)=>{if(u){i+=`<img src="cid:ecgchart${l}" alt="ECG Chart ${l+1}" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;" />`;const m=u.split(";base64,").pop();c.push({filename:`ecg_chart_${l+1}.png`,content:m,cid:`ecgchart${l}`})}}));const{data:g,error:d}=await resend.emails.send({from:`AI Vital Monitoring <${process.env.FROM_EMAIL}>`,to:[t],subject:`Your AI Vital Signs Analysis (for ${o})`,html:i,attachments:c});if(d)throw d;console.log("[SUCCESS] Email sent successfully!",g);const p=t!==o;r.status(200).json({success:!0,message:p?`Report delivered to the configured admin address (${t}) instead of ${o}.`:`Report delivered to ${t}.`,deliveredTo:t,intendedRecipient:o,rerouted:p})}catch(i){console.error("[ERROR] Failed to send email:",i),r.status(500).json({success:!1,message:"Failed to send email.",error:i.message})}}),app.post("/api/get-tts-token",async(e,r)=>{try{if(!firebaseConfigured)return r.status(500).json({success:!1,message:"Firebase credentials not configured"});const{GoogleAuth:o}=require("google-auth-library"),a=await new o({credentials:{type:"service_account",project_id:process.env.FIREBASE_PROJECT_ID,private_key_id:process.env.FIREBASE_PRIVATE_KEY_ID,private_key:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,`
`),client_email:process.env.FIREBASE_CLIENT_EMAIL,client_id:process.env.FIREBASE_CLIENT_ID,auth_uri:"https://accounts.google.com/o/oauth2/auth",token_uri:"https://oauth2.googleapis.com/token",auth_provider_x509_cert_url:"https://www.googleapis.com/oauth2/v1/certs",client_x509_cert_url:`https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`},scopes:["https://www.googleapis.com/auth/cloud-platform"]}).getAccessToken(),s=typeof a=="string"?a:a?.token;if(!s)throw new Error("Google Auth returned no access token");r.json({success:!0,accessToken:s})}catch(o){console.error("[ERROR] Failed to get TTS access token:",o),r.status(500).json({success:!1,message:"Failed to get access token",error:o.message})}}),app.listen(PORT,()=>{console.log(`
\u{1F680} AI Vital Signs Backend Server Started!`),console.log(`\u{1F4CD} Server running on: http://localhost:${PORT}`),console.log("\u{1F4E7} Email service: Resend API"),console.log(`\u{1F510} Authentication: ${firebaseConfigured?"Firebase OAuth Enabled":"Disabled"}`),console.log(`\u2699\uFE0F  Environment: ${process.env.NODE_ENV||"development"}`),console.log(`
\u{1F4CB} Configuration Checklist:`),console.log(`   \u2705 RESEND_API_KEY: ${process.env.RESEND_API_KEY?"Set":"Missing"}`),console.log(`   \u2705 FROM_EMAIL: ${process.env.FROM_EMAIL||"Missing"}`),console.log(`   \u2705 TO_EMAIL: ${process.env.TO_EMAIL||"Missing"}`),console.log(`   ${firebaseConfigured?"\u2705":"\u26A0\uFE0F"} Firebase Auth: ${firebaseConfigured?"Configured":"Not Configured"}`),console.log(`
\u{1F517} Available Endpoints:`),console.log("   \u{1F4E7} POST /send-report - Send email reports"),firebaseConfigured&&(console.log("   \u{1F510} POST /auth/verify - Verify authentication tokens"),console.log("   \u{1F464} GET /auth/user - Get user information"),console.log("   \u{1F504} POST /auth/refresh - Refresh tokens"),console.log("   \u{1F4CA} GET /auth/status - Check auth status"),console.log("   \u{1F6AA} POST /auth/logout - Logout user"),console.log("   \u2699\uFE0F  GET /auth/google/config - OAuth configuration")),console.log(`
\u{1F6D1} Press CTRL+C to stop the server.`)});
