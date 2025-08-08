// Configuration
const FHIR_BASE_URL = 'http://localhost:3001';
const CLIENT_ID = 'rtpbc-demo-client';
const REDIRECT_URI = 'http://localhost:3000/';

// State management
let accessToken = null;
let patientId = null;

// DOM elements
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const statusMessages = document.getElementById('status-messages');
const dataDisplay = document.querySelector('.data-display');
const mappingDetails = document.querySelector('.mapping-details');

// Add status message
function addStatus(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message status-${type}`;
    messageDiv.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    statusMessages.appendChild(messageDiv);
    statusMessages.scrollTop = statusMessages.scrollHeight;
}

// Close auth modal function (no longer needed but kept for compatibility)
function closeAuthModal() {
    // No-op
}

// Update step indicator
function updateStep(stepNumber, status) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (status === 'active') {
        // Remove active from all steps
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
        step.classList.add('active');
    } else if (status === 'completed') {
        step.classList.add('completed');
    }
}

// Start SMART launch
async function startSmartLaunch() {
    try {
        updateStep(1, 'active');
        addStatus('Fetching SMART configuration...', 'info');
        
        // Get SMART configuration
        const configResponse = await fetch(`${FHIR_BASE_URL}/.well-known/smart-configuration`);
        const config = await configResponse.json();
        
        addStatus('SMART configuration retrieved', 'success');
        
        // Generate state for CSRF protection
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('smart_state', state);
        
        // Build authorization URL
        const authParams = new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'patient/Patient.read patient/Coverage.read launch/patient',
            state: state,
            aud: FHIR_BASE_URL
        });
        
        const authUrl = `${config.authorization_endpoint}?${authParams}`;
        
        addStatus('Opening authorization window...', 'info');
        
        // Calculate center position for popup
        const width = 500;
        const height = 650;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        // Open auth in a popup window
        const authWindow = window.open(
            authUrl,
            'acme-health-auth',
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );
        
        // Check if popup was blocked
        if (!authWindow) {
            addStatus('Popup blocked - please allow popups and try again', 'error');
            return;
        }
        
        // Focus the popup
        authWindow.focus();
        
        // Set up message listener for cross-window communication
        window.addEventListener('message', function authMessageHandler(event) {
            if (event.origin !== FHIR_BASE_URL) return;
            
            if (event.data.type === 'auth-complete') {
                const { code, state } = event.data;
                
                // Clean up
                window.removeEventListener('message', authMessageHandler);
                if (authWindow && !authWindow.closed) {
                    authWindow.close();
                }
                
                // Handle the callback
                if (code && state) {
                    handleCallback(code, state);
                }
            }
        });
        
        // Also poll for window closure
        const checkInterval = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkInterval);
                addStatus('Authorization window closed by user', 'info');
            }
        }, 500);
        
    } catch (error) {
        addStatus(`Error starting SMART launch: ${error.message}`, 'error');
        updateStep(1, 'error');
    }
}

// Handle authorization callback
async function handleCallback(code = null, state = null) {
    // If not passed as parameters, try to get from URL
    if (!code || !state) {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
        state = urlParams.get('state');
    }
    
    if (code && state) {
        // Verify state
        const savedState = sessionStorage.getItem('smart_state');
        if (state !== savedState) {
            addStatus('State mismatch - possible CSRF attack', 'error');
            return;
        }
        
        updateStep(1, 'completed');
        updateStep(2, 'active');
        
        addStatus('Authorization code received', 'success');
        
        // Exchange code for token
        await exchangeToken(code);
        
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// Exchange authorization code for access token
async function exchangeToken(code) {
    try {
        addStatus('Exchanging authorization code for access token...', 'info');
        
        const tokenResponse = await fetch(`${FHIR_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.error_description || 'Token request failed');
        }
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
            accessToken = tokenData.access_token;
            patientId = tokenData.patient;
            
            addStatus('Access token received', 'success');
            addStatus(`Patient ID: ${patientId}`, 'info');
            updateStep(2, 'completed');
            
            // Automatically fetch coverage
            await fetchCoverage();
        } else {
            throw new Error('No access token received in response');
        }
        
    } catch (error) {
        addStatus(`Error exchanging token: ${error.message}`, 'error');
        console.error('Token exchange error:', error);
        updateStep(2, 'error');
    }
}

// Fetch CARIN DIC Coverage
async function fetchCoverage() {
    try {
        updateStep(3, 'active');
        addStatus('Fetching CARIN Digital Insurance Card Coverage...', 'info');
        
        const coverageUrl = `${FHIR_BASE_URL}/Coverage?patient=Patient/${patientId}&_profile=http://hl7.org/fhir/us/insurance-card/StructureDefinition/C4DIC-Coverage`;
        
        const response = await fetch(coverageUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const bundle = await response.json();
        
        if (bundle.entry && bundle.entry.length > 0) {
            const dicCoverage = bundle.entry[0].resource;
            
            addStatus('CARIN DIC Coverage retrieved successfully', 'success');
            updateStep(3, 'completed');
            
            // Display and transform
            displayCoverage(dicCoverage);
            
        } else {
            throw new Error('No coverage found');
        }
        
    } catch (error) {
        addStatus(`Error fetching coverage: ${error.message}`, 'error');
        updateStep(3, 'error');
    }
}

// Transform CARIN DIC to RTPBC Coverage
function transformToRTPBC(dicCoverage) {
    updateStep(4, 'active');
    addStatus('Transforming to RTPBC Coverage format...', 'info');
    
    // Extract pharmacy benefit values from DIC Coverage
    const classValues = {};
    dicCoverage.class.forEach(cls => {
        const code = cls.type.coding[0].code;
        classValues[code] = cls.value;
    });
    
    // Build RTPBC Coverage
    const rtpbcCoverage = {
        resourceType: "Coverage",
        id: "rtpbc-" + dicCoverage.id,
        meta: {
            profile: ["http://hl7.org/fhir/us/carin-rtpbc/StructureDefinition/rtpbc-coverage"]
        },
        status: dicCoverage.status,
        beneficiary: dicCoverage.beneficiary,
        payor: dicCoverage.payor,
        subscriberId: dicCoverage.subscriberId,
        class: [
            {
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/coverage-class",
                        code: "rxbin"
                    }]
                },
                value: classValues.rxbin || "",
                name: "Pharmacy Benefit BIN"
            },
            {
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/coverage-class",
                        code: "rxpcn"
                    }]
                },
                value: classValues.rxpcn || "",
                name: "Pharmacy Benefit PCN"
            },
            {
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/coverage-class",
                        code: "rxgroup"
                    }]
                },
                value: classValues.rxgroup || "",
                name: "Pharmacy Benefit Group ID"
            },
            {
                type: {
                    coding: [{
                        system: "http://terminology.hl7.org/CodeSystem/coverage-class",
                        code: "rxid"
                    }]
                },
                value: classValues.rxid || "",
                name: "Pharmacy Benefit Member ID"
            }
        ]
    };
    
    // Add payor identifier if available
    if (dicCoverage.payor && dicCoverage.payor[0]) {
        rtpbcCoverage.payor[0].identifier = {
            value: "ACME-HEALTH-123" // Mock payer ID
        };
    }
    
    addStatus('Transformation completed successfully', 'success');
    updateStep(4, 'completed');
    
    // Show step 5
    document.getElementById('step-5').style.display = 'block';
    
    // Simulate RTPBC request submission after a short delay
    setTimeout(() => {
        updateStep(5, 'active');
        addStatus('Submitting RTPBC request to PBM...', 'info');
        
        setTimeout(() => {
            addStatus('RTPBC request submitted successfully (simulated)', 'success');
            addStatus('Ready to receive real-time benefit information', 'success');
            updateStep(5, 'completed');
        }, 1500);
    }, 1000);
    
    return rtpbcCoverage;
}

// Display coverage resources
function displayCoverage(dicCoverage) {
    // Transform to RTPBC
    const rtpbcCoverage = transformToRTPBC(dicCoverage);
    
    // Show data display section
    dataDisplay.style.display = 'flex';
    mappingDetails.style.display = 'block';
    
    // Display DIC Coverage
    document.getElementById('dic-coverage').textContent = JSON.stringify(dicCoverage, null, 2);
    
    // Display RTPBC Coverage
    document.getElementById('rtpbc-coverage').textContent = JSON.stringify(rtpbcCoverage, null, 2);
    
    // Build mapping table
    const mappingData = [
        {
            dicField: 'Coverage.class[rxbin]',
            value: dicCoverage.class.find(c => c.type.coding[0].code === 'rxbin')?.value || 'N/A',
            rtpbcField: 'Coverage.class:bin'
        },
        {
            dicField: 'Coverage.class[rxpcn]',
            value: dicCoverage.class.find(c => c.type.coding[0].code === 'rxpcn')?.value || 'N/A',
            rtpbcField: 'Coverage.class:pcn'
        },
        {
            dicField: 'Coverage.class[rxgroup]',
            value: dicCoverage.class.find(c => c.type.coding[0].code === 'rxgroup')?.value || 'N/A',
            rtpbcField: 'Coverage.class:rxgroup-id'
        },
        {
            dicField: 'Coverage.class[rxid]',
            value: dicCoverage.class.find(c => c.type.coding[0].code === 'rxid')?.value || 'N/A',
            rtpbcField: 'Coverage.class:pbm-member-id'
        },
        {
            dicField: 'Coverage.subscriberId',
            value: dicCoverage.subscriberId || 'N/A',
            rtpbcField: 'Coverage.subscriberId'
        },
        {
            dicField: 'Coverage.payor[0].display',
            value: dicCoverage.payor?.[0]?.display || 'N/A',
            rtpbcField: 'Coverage.payor[0].display'
        }
    ];
    
    const tbody = document.getElementById('mapping-tbody');
    tbody.innerHTML = '';
    
    mappingData.forEach(mapping => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = mapping.dicField;
        row.insertCell(1).textContent = mapping.value;
        row.insertCell(2).textContent = mapping.rtpbcField;
    });
    
    // Show reset button
    resetBtn.style.display = 'inline-block';
}

// Reset demo
function resetDemo() {
    accessToken = null;
    patientId = null;
    sessionStorage.removeItem('smart_state');
    
    // Reset UI
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    
    statusMessages.innerHTML = '';
    dataDisplay.style.display = 'none';
    mappingDetails.style.display = 'none';
    resetBtn.style.display = 'none';
    
    addStatus('Demo reset - ready to start again', 'info');
}

// Event listeners
startBtn.addEventListener('click', startSmartLaunch);
resetBtn.addEventListener('click', resetDemo);

// Check for callback on page load
window.addEventListener('load', () => {
    handleCallback();
});