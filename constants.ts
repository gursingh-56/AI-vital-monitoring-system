
export const VITAL_RANGES = {
  heartRate: { min: 65, max: 85 },
  bloodSugar: { min: 80, max: 120 },
  spo2: { min: 98, max: 100 },
  temperature: { min: 97.8, max: 99.0 },
};

// Age-based blood pressure ranges
export const getBloodPressureRanges = (age: number) => {
  if (age >= 10 && age <= 29) {
    return {
      systolic: { min: 139, max: 155 },
      diastolic: { min: 78, max: 93 }
    };
  } else if (age >= 30) {
    return {
      systolic: { min: 120, max: 142 },
      diastolic: { min: 72, max: 88 }
    };
  } else {
    // Default ranges for ages outside specified ranges
    return {
      systolic: { min: 110, max: 125 },
      diastolic: { min: 70, max: 85 }
    };
  }
};

// A refined PQRST wave for a single beat (~1 second duration).
// Total length: 20 points. With a 50ms interval, this is 1000ms (1 second) per beat, i.e., 60 BPM.
const REFINED_PQRST_WAVE = [
  0, 0,                      // Isoelectric line
  0.15, 0.25, 0.15,          // P-wave
  0, 0,                      // PR segment
  -0.2,                      // Q-wave
  1.8,                       // R-wave
  -0.4,                      // S-wave
  0, 0,                      // ST segment
  0.3, 0.45, 0.5, 0.45, 0.3, // T-wave
  0, 0, 0,                   // Isoelectric line
];


// Lead I - Standard limb lead (RA to LA) - Clean, upright P-QRS-T complex
export const ECG_PATTERN_1 = REFINED_PQRST_WAVE.map(v => v * 20 + 50);

// Lead II - Long axis lead (RA to LL) - Tallest R-wave, most pronounced waves
const PQRST_WAVE_2 = REFINED_PQRST_WAVE.map((v, i) => {
    if (i === 3) return 0.4;      // More prominent P-wave
    if (i === 8) return 2.8;       // Much taller R-wave (Lead II characteristic)
    if (i === 14) return 0.8;     // More pronounced T-wave
    return v;
});
export const ECG_PATTERN_2 = PQRST_WAVE_2.map(v => v * 20 + 50);

// Lead III - Inferior lead (LA to LL) - Biphasic P-wave, inverted T-wave
const PQRST_WAVE_3 = REFINED_PQRST_WAVE.map((v, i) => {
    if (i === 3) return -0.2;     // Biphasic P-wave (negative then positive)
    if (i >= 12 && i <= 16) return v * -1.2; // More pronounced inverted T-wave
    if (i === 8) return 1.0;      // Smaller R-wave than Lead II
    return v;
});
export const ECG_PATTERN_3 = PQRST_WAVE_3.map(v => v * 20 + 50);


// --- Premature Ventricular Contraction (PVC) Pattern ---
// A PVC is a wide, bizarre beat followed by a compensatory pause.
// The entire PVC cycle (beat + pause) lasts for two normal beat cycles (40 points).
const PVC_WAVE = [
    -0.4,   // No P-wave, slight dip
    2.8,    // Very high, sharp R
    -3.5,   // Deep, wide S
    -1.0,
    0.8,
    -1.5,   // Bizarre morphology with inverted T-wave
    -1.2,
    -0.8,
    -0.3,
     0,
];

// Create a full 40-point cycle for the PVC event
const PVC_CYCLE = [
    ...PVC_WAVE,
    ...Array(40 - PVC_WAVE.length).fill(0) // Compensatory pause
];

// PVC appearance varies by lead
export const PVC_PATTERN_1 = PVC_CYCLE.map(v => v * 15 + 50); // Standard PVC for Lead I

const PVC_CYCLE_2 = PVC_CYCLE.map((v, i) => {
    if (i > 0 && i < 4) return v * 1.2; // Taller R in Lead II
    return v;
});
export const PVC_PATTERN_2 = PVC_CYCLE_2.map(v => v * 15 + 50);

const PVC_CYCLE_3 = PVC_CYCLE.map(v => v * -0.9); // Often predominantly negative in Lead III
export const PVC_PATTERN_3 = PVC_CYCLE_3.map(v => v * 15 + 50);


export const ECG_DATA_LENGTH = 150; // Increased to show more of the waveform
export const MONITORING_DURATION_MS = 30000;
