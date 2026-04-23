const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testFileUpload() {
  const baseUrl = 'http://localhost:5001/api/v1';
  console.log('--- Testing File Upload ---');

  try {
    // 1. Register a test tenant
    console.log('1. Registering test tenant...');
    const regResponse = await axios.post(`${baseUrl}/auth/register`, {
      displayName: 'QA Test Madarsa',
      slug: `qa-test-${Date.now()}`,
      institutionType: 'SMALL_LOCAL_MADARSA',
      legalName: 'QA Test Legal Name',
      primaryEmail: `qa-${Date.now()}@example.com`,
      primaryPhone: '1234567890',
      adminUser: {
        fullName: 'QA Admin',
        email: `qa-admin-${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '1234567890'
      }
    });

    const { token, tenantId } = regResponse.data;
    console.log(`Success: Tenant ${tenantId} registered.`);

    // 2. Prepare dummy image
    const imagePath = path.join(__dirname, 'test-logo.png');
    fs.writeFileSync(imagePath, 'dummy-image-content');

    // 3. Upload Logo
    console.log('2. Uploading logo...');
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath), 'test-logo.png');

    const uploadResponse = await axios.post(`${baseUrl}/tenant/branding/upload/logo`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId
      }
    });

    console.log(`Success: Upload Response:`, uploadResponse.data);
    const uploadedUrl = uploadResponse.data.data.url;
    console.log(`Uploaded URL: ${uploadedUrl}`);

    // verify file exists in uploads dir
    // We can't easily check filesystem via axios, but we can hit the URL
    console.log('3. Verifying URL access...');
    const getResponse = await axios.get(uploadedUrl);
    console.log(`Success: URL accessible (Status: ${getResponse.status})`);

    // 4. Test Security: Upload invalid file
    console.log('4. Testing invalid file upload (.txt)...');
    const txtPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(txtPath, 'some text');
    
    const badForm = new FormData();
    badForm.append('file', fs.createReadStream(txtPath), 'test.txt');

    try {
      await axios.post(`${baseUrl}/tenant/branding/upload/logo`, badForm, {
        headers: {
          ...badForm.getHeaders(),
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId
        }
      });
      console.log('Fail: Should have rejected .txt file');
    } catch (error) {
      console.log(`Success: Invalid file rejected (Status: ${error.response?.status}, Code: ${error.response?.data?.error?.code})`);
    }

    // Cleanup
    fs.unlinkSync(imagePath);
    fs.unlinkSync(txtPath);

  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testFileUpload();
