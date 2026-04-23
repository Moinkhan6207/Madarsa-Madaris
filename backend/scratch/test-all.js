const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5001/api/v1';

async function runVerification() {
  console.log('🚀 STARTING PRODUCTION HARDENING VERIFICATION SUITE\n');

  // 1. Rate Limiting Check
  console.log('--- 1. Verification: Rate Limiting ---');
  let authBlocked = false;
  for (let i = 1; i <= 6; i++) {
    try {
      await axios.post(`${BASE_URL}/auth/login`, { email: 'test@example.com', password: '123' });
    } catch (error) {
      if (error.response?.status === 429) {
        authBlocked = true;
        console.log(`✅ Rate limit triggered on attempt ${i} (Status: 429)`);
        break;
      }
    }
  }
  if (!authBlocked) console.log('❌ Rate limiting check failed (No 429 seen)');

  console.log('\n--- Waiting 65s for rate limit clear (Minute-based limiter) ---');
  await new Promise(r => setTimeout(r, 65000));

  // 2. Registration + Email Check
  console.log('\n--- 2. Verification: Registration & Email ---');
  let token, tenantId;
  try {
    const regResp = await axios.post(`${BASE_URL}/auth/register`, {
      displayName: 'Verification Madarsa',
      slug: `verify-${Date.now()}`,
      institutionType: 'TRUST_RUN_IDARA',
      legalName: 'Verification Legal Name',
      primaryEmail: `verify-${Date.now()}@test.com`,
      primaryPhone: '0000000000',
      adminUser: {
        fullName: 'Verifier Admin',
        email: `verifier-${Date.now()}@test.com`,
        password: 'Password123!',
        phone: '0000000000'
      }
    });
    token = regResp.data.data.token;
    tenantId = regResp.data.data.tenantId;
    console.log(`✅ Registration successful (Tenant ID: ${tenantId})`);
    console.log('👉 ACTION: Check server console for "[Email Service] Email sent to: ..."');
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
  }

  // 3. File Upload Check
  console.log('\n--- 3. Verification: File Upload & Security ---');
  if (token && tenantId) {
    const dummyImg = path.join(__dirname, 'dummy.png');
    const dummyTxt = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyImg, 'fake-png-content');
    fs.writeFileSync(dummyTxt, 'fake-txt-content');

    // Valid Upload
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(dummyImg), 'logo.png');
      const upResp = await axios.post(`${BASE_URL}/tenant/branding/upload/logo`, form, {
        headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      });
      console.log('✅ File upload successful (.png)');
      console.log(`🔗 Public URL: ${upResp.data.data.url}`);
    } catch (error) {
      console.log('❌ File upload failed (.png):', error.response?.data || error.message);
    }

    // Invalid Upload
    try {
      const formBad = new FormData();
      formBad.append('file', fs.createReadStream(dummyTxt), 'test.txt');
      await axios.post(`${BASE_URL}/tenant/branding/upload/logo`, formBad, {
        headers: { ...formBad.getHeaders(), 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      });
      console.log('❌ Security fail: .txt file was accepted');
    } catch (error) {
      console.log(`✅ Security pass: .txt file rejected (Status: ${error.response?.status})`);
    }

    fs.unlinkSync(dummyImg);
    fs.unlinkSync(dummyTxt);
  }

  // 4. Logging Check
  console.log('\n--- 4. Verification: Advanced Logging ---');
  if (token && tenantId) {
    try {
      const resp = await axios.get(`${BASE_URL}/tenant/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId }
      });
      console.log(`✅ Log-triggering request successful (Status: ${resp.status})`);
      console.log('👉 ACTION: Check server logs for requestId, tenantId, and userId');
    } catch (error) {
      console.log('❌ Log-triggering request failed:', error.message);
    }
  }

  console.log('\n🏁 VERIFICATION SUITE COMPLETE');
}

runVerification();
