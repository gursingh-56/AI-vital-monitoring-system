import{GoogleGenAI as m}from"@google/genai";export const config={runtime:"nodejs"};const o=(e,t)=>new Response(JSON.stringify(e),{status:t,headers:{"Content-Type":"application/json"}}),n=e=>typeof e=="number"&&Number.isFinite(e);function c(e){if(typeof e!="object"||e===null)return null;const t=e,a=t.bloodPressure;return!n(t.heartRate)||!n(t.bloodSugar)||!n(t.spo2)||!n(t.temperature)||typeof a!="object"||a===null||!n(a.systolic)||!n(a.diastolic)?null:{heartRate:t.heartRate,bloodSugar:t.bloodSugar,spo2:t.spo2,temperature:t.temperature,bloodPressure:{systolic:a.systolic,diastolic:a.diastolic}}}const g=(e,t)=>`
    You are a highly intelligent medical AI assistant. Your task is to analyze the following patient vital signs and produce a detailed, easy-to-understand health report.

---

Patient Information:
- Age: ${t||"Not specified"}
- Heart Rate: ${e.heartRate} bpm
- Blood Pressure: ${e.bloodPressure.systolic}/${e.bloodPressure.diastolic} mmHg
- Blood Sugar: ${e.bloodSugar} mg/dL
- SpO2: ${e.spo2}%
- Temperature: ${e.temperature}\xB0F

---

You must return your response strictly as a valid JSON object in the following structure:

{
  "overall_assessment": "string - clear, concise summary of the patient's overall condition (2\u20133 sentences).",
  "detailed_analysis": {
    "heart_rate": {
      "value": "number + unit",
      "status": "Normal/High/Low",
      "explanation": "2\u20134 sentence professional-level explanation in plain text (medium length, no markdown)."
    },
    "blood_pressure": {
      "value": "systolic/diastolic mmHg",
      "status": "Normal/High/Low",
      "explanation": "2\u20134 sentence professional-level explanation in plain text (medium length, no markdown)."
    },
    "blood_sugar": {
      "value": "number + unit",
      "status": "Normal/High/Low",
      "explanation": "2\u20134 sentence professional-level explanation in plain text (medium length, no markdown)."
    },
    "spo2": {
      "value": "number + unit",
      "status": "Normal/High/Low",
      "explanation": "2\u20134 sentence professional-level explanation in plain text (medium length, no markdown)."
    },
    "temperature": {
      "value": "number + unit",
      "status": "Normal/High/Low",
      "explanation": "2\u20134 sentence professional-level explanation in plain text (medium length, no markdown)."
    }
  },
  "potential_diagnosis": "string - cautious interpretation using phrases like 'These readings might suggest...' or 'It\u2019s worth considering...' (2\u20133 sentences). Avoid definitive statements.",
  "recommendations": [
    "Adequate rest and sleep (7\u20139 hours nightly)",
    "Proper hydration with electrolytes",
    "Light physical activity if appropriate",
    "Stress management techniques",
    "Regular health monitoring"
  ]
}

---

Reference Ranges (standard clinical values \u2014 classify strictly against these):
- Heart Rate: 60\u2013100 bpm (normal); below 60 bradycardia, above 100 tachycardia
- Blood Pressure (ACC/AHA categories, adults of any age):
  * Normal: less than 120/80 mmHg
  * Elevated: systolic 120\u2013129 and diastolic less than 80 mmHg
  * Stage 1 hypertension: systolic 130\u2013139 or diastolic 80\u201389 mmHg
  * Stage 2 hypertension: systolic 140 or higher, or diastolic 90 or higher
- Blood Sugar (post-meal): less than 140 mg/dL (normal)
- SpO2: 95\u2013100% (normal); below 95% is low
- Temperature: 97.8\u201399.0\xB0F (normal); 100.4\xB0F and above is fever

---

Formatting Rules:
1. Output only valid JSON \u2014 no markdown, no headings, no bullet symbols outside arrays.
2. Keep tone professional, objective, and medical-grade.
3. Explanations should be medium length \u2014 detailed enough to sound clinical but easy for a patient to understand.
4. Do not include disclaimers, AI mentions, or trailing comments.
5. No text outside the JSON object.

---

Example Output:

{
  "overall_assessment": "The patient's vital signs are mostly within healthy limits, though the blood pressure and sugar levels indicate mild elevations. Overall, the cardiovascular and respiratory parameters appear stable.",
  "detailed_analysis": {
    "heart_rate": {
      "value": "85 bpm",
      "status": "Normal",
      "explanation": "The heart rate is within the healthy range for adults, indicating proper cardiac rhythm and stable circulation. This suggests the heart is functioning effectively without signs of stress or overexertion."
    },
    "blood_pressure": {
      "value": "128/86 mmHg",
      "status": "Slightly High",
      "explanation": "This reading is slightly above the normal range, which could indicate mild prehypertension. It may result from temporary stress, caffeine intake, or an early sign of elevated blood pressure that should be monitored over time."
    },
    "blood_sugar": {
      "value": "160 mg/dL",
      "status": "High",
      "explanation": "A blood sugar level above 140 mg/dL after eating is higher than normal and could point to early insulin resistance. Monitoring dietary habits and reducing sugary food intake may help maintain better glucose control."
    },
    "spo2": {
      "value": "97%",
      "status": "Normal",
      "explanation": "Oxygen saturation is within the normal range, showing that the lungs and cardiovascular system are efficiently delivering oxygen throughout the body. No signs of respiratory distress are present."
    },
    "temperature": {
      "value": "98.4\xB0F",
      "status": "Normal",
      "explanation": "The body temperature falls comfortably within the normal range, indicating no signs of fever, infection, or inflammation at this time."
    }
  },
  "potential_diagnosis": "These readings might suggest mild hypertension and slightly elevated blood sugar, which could indicate early metabolic imbalance or lifestyle-related stress factors. It\u2019s worth considering follow-up monitoring to prevent long-term complications.",
  "recommendations": [
    "Maintain consistent sleep schedule (7\u20139 hours per night)",
    "Stay hydrated and limit caffeine and sodium intake",
    "Adopt a balanced diet with reduced sugar and processed food",
    "Engage in light to moderate exercise such as walking or yoga",
    "Regularly monitor blood pressure and sugar levels for trends"
  ]
}
`;export default async function h(e){if(e.method!=="POST")return o({error:"Method not allowed"},405);const t=process.env.GEMINI_API_KEY;if(!t)return console.error("GEMINI_API_KEY is not set on the server"),o({error:"Analysis service is not configured."},500);let a;try{a=await e.json()}catch{return o({error:"Invalid JSON body."},400)}const{vitals:l,age:r}=a??{},s=c(l);if(!s)return o({error:"A complete set of numeric vital signs is required."},400);const d=n(r)?r:void 0;try{const u=await new m({apiKey:t}).models.generateContent({model:"gemini-2.5-flash",contents:g(s,d)});return o({text:u.text},200)}catch(i){return console.error("Error generating analysis from Gemini:",i),o({error:"The AI service is unavailable. Please try again later."},502)}}
