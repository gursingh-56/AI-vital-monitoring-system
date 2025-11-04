/**
 * AI VITAL SIGNS MONITORING BACKEND SERVER
 * 
 * This Express.js server handles:
 * 1. Email report generation and sending via Resend API
 * 2. Markdown to HTML conversion for medical reports
 * 3. ECG image attachment processing
 * 4. CORS handling for frontend communication
 * 
 * Key Features:
 * - Environment variable validation for security
 * - Professional email formatting with medical styling
 * - Base64 image processing for ECG charts
 * - Error handling and logging for debugging
 * 
 * Dependencies: express, cors, resend, dotenv
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const authRoutes = require('./auth-routes');
const { authenticateToken, optionalAuth } = require('./auth-middleware');

/**
 * ENVIRONMENT VARIABLE VALIDATION
 * 
 * Ensures all required environment variables are present before starting the server.
 * This prevents runtime errors and provides clear feedback about missing configuration.
 * 
 * Required Variables:
 * - RESEND_API_KEY: API key for Resend email service
 * - FROM_EMAIL: Verified sender email address
 * - TO_EMAIL: Admin email address for receiving reports
 */
const requiredEnvVars = ['RESEND_API_KEY', 'FROM_EMAIL', 'TO_EMAIL'];
const firebaseEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`\n[ERROR] Missing required environment variable: ${varName}`);
    console.error('Please ensure you have a .env file in the /backend directory with all required values from .env.example.');
    process.exit(1);
  }
}

// Check Firebase environment variables (optional for basic functionality)
let firebaseConfigured = true;
for (const varName of firebaseEnvVars) {
  if (!process.env[varName]) {
    console.warn(`\n[WARNING] Missing Firebase environment variable: ${varName}`);
    firebaseConfigured = false;
  }
}

if (!firebaseConfigured) {
  console.warn('\n[WARNING] Firebase authentication will not be available.');
  console.warn('Please configure Firebase environment variables for authentication features.');
}

// Initialize Express app and Resend email service
const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * MIDDLEWARE CONFIGURATION
 * 
 * Sets up essential middleware for the Express server:
 * 1. CORS: Allows frontend to communicate with backend
 * 2. JSON Parser: Handles incoming JSON data with 5MB limit for ECG images
 * 
 * Security Note: CORS is set to allow all origins for development.
 * In production, restrict to specific frontend domains.
 */
app.use(cors({
  origin: '* ', // Allow all origins for development. For production, you'd restrict this.
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type, Authorization',
}));
app.use(express.json({ limit: '5mb' })); // 5MB limit for base64 ECG images

// Authentication routes
if (firebaseConfigured) {
  app.use('/auth', authRoutes);
  console.log('✅ Authentication routes enabled');
} else {
  console.log('⚠️ Authentication routes disabled (Firebase not configured)');
}

const PORT = process.env.PORT || 3001;

/**
 * HEALTH CHECK ENDPOINT
 * 
 * Simple GET endpoint to verify server is running and accessible.
 * Used by frontend BackendStatusIndicator component to check connectivity.
 * 
 * Returns: Simple text response confirming server status
 */
app.get('/', (req, res) => {
  res.send('AI Vitals Backend is running! Ready to send reports via Resend.');
});

/**
 * JSON ANALYSIS TO HTML CONVERTER
 * 
 * Converts structured JSON analysis data into professional HTML emails.
 * Handles medical report formatting with proper styling and structure.
 * 
 * Features:
 * - Converts JSON analysis object to styled HTML
 * - Color-coded status indicators for vital signs
 * - Professional medical styling
 * - Responsive email layout
 * 
 * @param {Object} analysis - The JSON analysis object from AI
 * @param {string} intendedRecipient - The email address the user entered
 * @returns {string} HTML formatted string ready for email
 */
const analysisToHtml = (analysis, intendedRecipient) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return '#10b981'; // green
      case 'high':
        return '#ef4444'; // red
      case 'low':
        return '#f59e0b'; // yellow
      default:
        return '#6b7280'; // gray
    }
  };

  let html = `
    <div style="font-family: Arial, sans-serif; color: #475569; max-width: 600px; margin: auto; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; background: #ffffff;">
      <p style="font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
        This report was generated for: <strong>${intendedRecipient}</strong>
      </p>
      
      <!-- Overall Assessment -->
      <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; color: #1e40af; margin: 0 0 12px 0;">📊 Overall Assessment</h2>
        <p style="color: #374151; line-height: 1.6; margin: 0;">${analysis.overall_assessment}</p>
      </div>

      <!-- Detailed Analysis -->
      <h2 style="font-size: 22px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 16px 0;">🔍 Detailed Analysis</h2>
  `;

  // Add each vital sign
  const vitals = [
    { key: 'heart_rate', name: '❤️ Heart Rate', data: analysis.detailed_analysis.heart_rate },
    { key: 'blood_pressure', name: '🩸 Blood Pressure', data: analysis.detailed_analysis.blood_pressure },
    { key: 'blood_sugar', name: '🍯 Blood Sugar', data: analysis.detailed_analysis.blood_sugar },
    { key: 'spo2', name: '💨 SpO2 (Oxygen Saturation)', data: analysis.detailed_analysis.spo2 },
    { key: 'temperature', name: '🌡️ Temperature', data: analysis.detailed_analysis.temperature }
  ];

  vitals.forEach(vital => {
    const statusColor = getStatusColor(vital.data.status);
    html += `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-size: 18px; color: #1e293b; margin: 0;">${vital.name}</h3>
          <span style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}50; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
            ${vital.data.status}
          </span>
        </div>
        <p style="color: #3b82f6; font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">${vital.data.value}</p>
        <p style="color: #6b7280; line-height: 1.5; margin: 0; font-size: 14px;">${vital.data.explanation}</p>
      </div>
    `;
  });

  // Add potential diagnosis
  html += `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h2 style="font-size: 20px; color: #92400e; margin: 0 0 12px 0;">🔬 Potential Diagnosis</h2>
      <p style="color: #374151; line-height: 1.6; margin: 0;">${analysis.potential_diagnosis}</p>
    </div>
  `;

  // Add recommendations
  html += `
    <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h2 style="font-size: 20px; color: #065f46; margin: 0 0 12px 0;">💡 Recommendations</h2>
      <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
  `;
  
  analysis.recommendations.forEach(rec => {
    html += `<li style="margin-bottom: 8px;">${rec}</li>`;
  });
  
  html += `
      </ul>
    </div>
  </div>
  `;

  return html;
};

/**
 * MARKDOWN TO HTML CONVERTER (LEGACY)
 * 
 * Converts AI-generated markdown reports into professional HTML emails.
 * Handles medical report formatting with proper styling and structure.
 * 
 * Features:
 * - Converts markdown headers (##, ###) to styled HTML headers
 * - Processes bullet points (-) into HTML lists
 * - Converts bold text (**text**) to <strong> tags
 * - Adds recipient information header
 * - Applies medical-grade styling for professional appearance
 * 
 * @param {string} markdown - The markdown text from the AI report
 * @param {string} intendedRecipient - The email address the user entered
 * @returns {string} HTML formatted string ready for email
 */
const markdownToHtml = (markdown, intendedRecipient) => {
  let html = `<div style="font-family: Arial, sans-serif; color: #475569; max-width: 600px; margin: auto; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px;">`;
  html += `<p style="font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">This report was generated for: <strong>${intendedRecipient}</strong></p>`;
  
  let inList = false;
  const lines = markdown.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2 style="font-size: 22px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; margin-bottom: 16px;">${processedLine.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
       if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 style="font-size: 18px; color: #334155; margin-top: 20px; margin-bottom: 12px;">${processedLine.substring(4)}</h3>`;
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul style="list-style-type: disc; margin-left: 20px; padding-left: 5px;">';
        inList = true;
      }
      html += `<li style="margin-bottom: 8px;">${processedLine.substring(2)}</li>`;
    } else {
       if (inList) { html += '</ul>'; inList = false; }
      html += `<p style="line-height: 1.6; margin-bottom: 16px;">${processedLine}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  html += '</div>';
  return html;
};

/**
 * EMAIL REPORT SENDING ENDPOINT
 * 
 * Main API endpoint for processing and sending AI analysis reports via email.
 * Handles the complete workflow from request validation to email delivery.
 * 
 * Process Flow:
 * 1. Validates incoming request data (email, report, ECG images)
 * 2. Converts markdown report to professional HTML
 * 3. Processes ECG images as email attachments
 * 4. Sends email via Resend API with proper formatting
 * 5. Returns success/error response to frontend
 * 
 * Security Features:
 * - Validates required fields before processing
 * - Reroutes emails to verified admin address
 * - Handles base64 image processing safely
 * - Comprehensive error handling and logging
 * 
 * @route POST /send-report
 * @body {string} email - Intended recipient email
 * @body {string} report - AI-generated markdown report
 * @body {Array} ecgImages - Base64 encoded ECG chart images
 */
app.post('/send-report', optionalAuth, async (req, res) => {
  console.log('Received request on /send-report');
  
  // Log authentication status
  if (req.user) {
    console.log(`📧 Email request from authenticated user: ${req.user.email} (${req.user.uid})`);
  } else {
    console.log('📧 Email request from anonymous user');
  }
  
  // Extract and validate request data
  const { email: intendedRecipient, report, ecgImages } = req.body;

  // Validate required fields
  if (!intendedRecipient || !report) {
    console.log('[ERROR] Request rejected: Missing email or report.');
    return res.status(400).json({ success: false, message: 'Email and report are required.' });
  }
  
  // Security: Reroute to verified admin email (prevents spam/abuse)
  const actualRecipient = process.env.TO_EMAIL;
  console.log(`Intended recipient: ${intendedRecipient}. Rerouting to verified address: ${actualRecipient}`);

  try {
    // Convert JSON analysis to professional HTML
    let htmlReport = analysisToHtml(report, intendedRecipient);
    const attachments = [];

    /**
     * ECG IMAGE PROCESSING
     * 
     * Processes multiple ECG chart images for email attachment:
     * 1. Adds ECG section to HTML report
     * 2. Extracts base64 data from data URLs
     * 3. Creates email attachments with unique content IDs
     * 4. Embeds images in HTML using cid references
     */
    if (ecgImages && ecgImages.length > 0) {
      htmlReport += '<br><h3>ECG Readings</h3>';
      ecgImages.forEach((ecgImage, index) => {
        if (ecgImage) {
          // Add image to HTML with embedded reference
          htmlReport += `<img src="cid:ecgchart${index}" alt="ECG Chart ${index + 1}" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;" />`;
          
          // Extract base64 data from data URL (format: "data:image/png;base64,<data>")
          const base64Data = ecgImage.split(';base64,').pop();
          
          // Create email attachment with unique content ID
          attachments.push({
            filename: `ecg_chart_${index + 1}.png`,
            content: base64Data,
            cid: `ecgchart${index}`, // Content ID for HTML embedding
          });
        }
      });
    }

    /**
     * EMAIL SENDING VIA RESEND API
     * 
     * Sends the processed report via Resend email service:
     * - Professional sender name and verified email
     * - Clear subject line with recipient information
     * - HTML-formatted report with embedded ECG images
     * - Proper error handling and logging
     */
    const { data, error } = await resend.emails.send({
      from: `AI Vital Monitoring <${process.env.FROM_EMAIL}>`,
      to: [actualRecipient],
      subject: `Your AI Vital Signs Analysis (for ${intendedRecipient})`,
      html: htmlReport,
      attachments: attachments,
    });

    // Handle Resend API errors
    if (error) {
      throw error;
    }

    // Success response
    console.log('[SUCCESS] Email sent successfully!', data);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
    
  } catch (error) {
    // Comprehensive error handling and logging
    console.error('[ERROR] Failed to send email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email.', 
      error: error.message 
    });
  }
});

/**
 * TTS ACCESS TOKEN ENDPOINT
 * 
 * Provides access token for Google Cloud Text-to-Speech API
 * Uses existing Firebase service account credentials
 */
app.post('/api/get-tts-token', async (req, res) => {
  try {
    // Check if we have Firebase credentials
    if (!firebaseConfigured) {
      return res.status(500).json({ 
        success: false, 
        message: 'Firebase credentials not configured' 
      });
    }

    // Use Google Auth Library to get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const accessToken = await auth.getAccessToken();
    
    res.json({ 
      success: true, 
      accessToken: accessToken.token 
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get TTS access token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get access token',
      error: error.message 
    });
  }
});

/**
 * SERVER STARTUP
 * 
 * Starts the Express server on the configured port.
 * Provides startup information and configuration reminders.
 * 
 * Features:
 * - Port configuration with fallback to 3001
 * - Service confirmation messages
 * - Environment setup reminders
 * - Graceful shutdown instructions
 */
app.listen(PORT, () => {
  console.log(`\n🚀 AI Vital Signs Backend Server Started!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📧 Email service: Resend API`);
  console.log(`🔐 Authentication: ${firebaseConfigured ? 'Firebase OAuth Enabled' : 'Disabled'}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 Configuration Checklist:`);
  console.log(`   ✅ RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set' : 'Missing'}`);
  console.log(`   ✅ FROM_EMAIL: ${process.env.FROM_EMAIL || 'Missing'}`);
  console.log(`   ✅ TO_EMAIL: ${process.env.TO_EMAIL || 'Missing'}`);
  console.log(`   ${firebaseConfigured ? '✅' : '⚠️'} Firebase Auth: ${firebaseConfigured ? 'Configured' : 'Not Configured'}`);
  console.log(`\n🔗 Available Endpoints:`);
  console.log(`   📧 POST /send-report - Send email reports`);
  if (firebaseConfigured) {
    console.log(`   🔐 POST /auth/verify - Verify authentication tokens`);
    console.log(`   👤 GET /auth/user - Get user information`);
    console.log(`   🔄 POST /auth/refresh - Refresh tokens`);
    console.log(`   📊 GET /auth/status - Check auth status`);
    console.log(`   🚪 POST /auth/logout - Logout user`);
    console.log(`   ⚙️  GET /auth/google/config - OAuth configuration`);
  }
  console.log(`\n🛑 Press CTRL+C to stop the server.`);
});
