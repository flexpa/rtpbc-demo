import express from 'express';
import cors from 'cors';
import { 
  mockPatient, 
  mockDICCoverage, 
  mockOrganization, 
  mockCapabilityStatement,
  mockSmartConfiguration 
} from './mockData.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for client
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock auth state storage (in production, use proper session management)
const authSessions = new Map();

// SMART Configuration endpoint
app.get('/.well-known/smart-configuration', (req, res) => {
  res.json(mockSmartConfiguration);
});

// Serve static files for auth
app.use('/auth', express.static(__dirname));

// Store session endpoint (for auth page)
app.post('/auth/store-session', (req, res) => {
  const { code, client_id, scope, patient_id } = req.body;
  
  // Store the session with the auth code
  authSessions.set(code, {
    client_id,
    scope,
    patient_id
  });
  
  res.json({ success: true });
});

// Authorization endpoint (simplified for demo)
app.get('/authorize', (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    aud
  } = req.query;

  // Store the auth request parameters in the URL
  const authPageUrl = new URL('http://localhost:3001/auth/auth.html');
  authPageUrl.searchParams.set('redirect_uri', redirect_uri);
  authPageUrl.searchParams.set('state', state);
  authPageUrl.searchParams.set('client_id', client_id);
  authPageUrl.searchParams.set('scope', scope || 'patient/Patient.read patient/Coverage.read');
  
  // Redirect to the auth page
  res.redirect(authPageUrl.toString());
});

// Token endpoint
app.post('/token', (req, res) => {
  const { code, grant_type, redirect_uri, client_id } = req.body;

  console.log('Token request:', { code, grant_type, client_id });

  // Validate code
  const session = authSessions.get(code);
  if (!session) {
    console.log('Invalid code - available codes:', Array.from(authSessions.keys()));
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid authorization code'
    });
  }

  // Clean up used code
  authSessions.delete(code);

  // Return mock token
  const tokenResponse = {
    access_token: `mock-access-token-${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: session.scope || 'patient/Patient.read patient/Coverage.read',
    patient: session.patient_id
  };
  
  console.log('Token response:', tokenResponse);
  res.json(tokenResponse);
});

// FHIR Capability Statement
app.get('/metadata', (req, res) => {
  res.json(mockCapabilityStatement);
});

// Patient endpoint
app.get('/Patient/:id', (req, res) => {
  if (req.params.id === mockPatient.id) {
    res.json(mockPatient);
  } else {
    res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        details: { text: 'Patient not found' }
      }]
    });
  }
});

// Coverage search endpoint
app.get('/Coverage', (req, res) => {
  const { patient, _profile } = req.query;
  
  // Check if searching for DIC profile
  if (_profile === 'http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-Coverage') {
    if (patient === `Patient/${mockPatient.id}`) {
      res.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: 1,
        entry: [{
          resource: mockDICCoverage,
          fullUrl: `http://localhost:${PORT}/Coverage/${mockDICCoverage.id}`
        }]
      });
    } else {
      res.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: []
      });
    }
  } else {
    res.json({
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
      entry: []
    });
  }
});

// Coverage read endpoint
app.get('/Coverage/:id', (req, res) => {
  if (req.params.id === mockDICCoverage.id || req.params.id === 'Example-Coverage1') {
    res.json(mockDICCoverage);
  } else {
    res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        details: { text: 'Coverage not found' }
      }]
    });
  }
});

// Organization endpoint
app.get('/Organization/:id', (req, res) => {
  if (req.params.id === mockOrganization.id || req.params.id === 'Example-PayerOrganization1') {
    res.json(mockOrganization);
  } else {
    res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        details: { text: 'Organization not found' }
      }]
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock FHIR server running at http://localhost:${PORT}`);
  console.log(`SMART configuration at http://localhost:${PORT}/.well-known/smart-configuration`);
});